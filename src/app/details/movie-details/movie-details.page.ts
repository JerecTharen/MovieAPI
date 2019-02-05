import {Component, OnDestroy, OnInit} from '@angular/core';
import {MovieAPIService} from '../../API/movie-api.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {LoadingController, ModalController} from '@ionic/angular';
import {RatingComponent} from './rating/rating.component';
import {AuthService} from '../../login/auth.service';
import {Movie} from '../../shared/movie';
import {FirebaseService} from '../../user-list/firebase.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {CommentsService} from 'src/app/login/comments.service';
import {ActivatedRoute} from '@angular/router';
import {Subject} from "rxjs";
import {takeUntil, tap} from "rxjs/operators";
import {subscribeToObservable} from "rxjs/internal-compatibility";
import {LoaderFixService} from "../../shared/loader-fix.service";

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.page.html',
  styleUrls: ['./movie-details.page.scss'],
})
export class MovieDetailsPage implements OnInit, OnDestroy {


  constructor(private movieApi: MovieAPIService,
              public sanitizer: DomSanitizer,
              public modalController: ModalController,
              private auth: AuthService,
              private firebase: FirebaseService,
              private commentsService: CommentsService,
              private afAuth: AngularFireAuth,
              private route: ActivatedRoute,
              private loader: LoadingController,
              private loadingService: LoaderFixService
  ) { }

  authenticated;
  id = Number(this.route.parent.snapshot.paramMap.get('id'));
  movie;
  private url: string;
  video: SafeResourceUrl;
  watched: boolean;
  watchList: boolean;
  user;
  private currentUserRating: number;
  // private movieComments;
  private showRating = false;
  private displayOverview;
  private isTooLong = false;
  private unsubscribe$ = new Subject();

  ngOnInit() {
    this.movieApi.getMovieDetail(this.id).subscribe(data => {
        console.log('movie api sub called');
      this.movie = data;
      this.checkOverviewLength();
      console.log(this.authenticated);
      if (this.authenticated) {
        this.checkWatched();
        console.log(this.watched);
      } // end of if statement
      console.log(this.loadingService.getLoading());
      if(this.loadingService.getLoading()){
          this.loader.dismiss();
          this.loadingService.stopLoading();
      }
    });// end up sub callback
    if (this.afAuth.auth.currentUser !== null) {
        this.authenticated = !!this.afAuth.auth.currentUser.uid;
        // this.movieComments = this.commentsService.getCommentsFor(this.id);
        this.firebase.getUserMovieRating(this.id).pipe(
            takeUntil(this.unsubscribe$),
            tap(userMovieData => {
                if (userMovieData) {
                    this.showRating = true;
                    //@ts-ignore
                    this.currentUserRating = userMovieData.rating;
                }//end of if statement
            })//end of sub callback
        ).subscribe()//end of pipe
    }//end of auth if statement
  } //end of ngOnInit

  ngOnDestroy(): void {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
  }

    async presentModal() {
    const modal = await this.modalController.create({
      component: RatingComponent,
      componentProps: { value: this.movie, rating: this.currentUserRating}
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      const movieData: Movie = {
        title: data.title,
        movieID: data.movieId,
        rating: data.rating,
        pic: data.pic,
        genres: data.genres,
      };
      if (this.watchList) {
          this.firebase.removeToSee(movieData.movieID);
      }
      this.firebase.pushHasSeen(movieData);
      this.checkWatched();
      this.commentsService.getUserComment(this.movie.id, this.afAuth.auth.currentUser.uid).subscribe(commentData => {
          if (commentData) {
              this.commentsService.updateCommentRating(this.movie.id, this.afAuth.auth.currentUser.uid, movieData.rating);
          }//end of if(commentData) statement
      });//end of sub callback
    }//end of if(data) statement
  }//end of presentModal()

  addToSee() {
    const movieData: Movie = {
      title: this.movie.title,
      movieID: this.movie.id,
      pic: this.movie.poster_path,
      genres: this.movie.genres,
    };
    this.firebase.pushToSee(movieData);
    this.checkWatched();
  }

  checkWatched() {
      if (this.afAuth.auth.currentUser !== null) {
          this.firebase.getHasSeenMovie(this.movie.id).subscribe(docSnapshot => {
              console.log(docSnapshot.exists);
              if (docSnapshot.exists) {
                  this.watched = true;
              }
          });
          this.firebase.getToSeeMovie(this.movie.id).subscribe(docSnapshot => {
              if (docSnapshot.exists) {
                  this.watchList = true;
              }
          });
      }
  }

  checkOverviewLength(): void {
      if (this.movie) {
          if (this.movie.overview.length > 200) {
              this.displayOverview =  this.movie.overview.slice(0, 199);
              this.isTooLong = true;
          } else {
              this.displayOverview = this.movie.overview;
          }
      }
  }
  showAllDetails(): void {
      this.displayOverview = this.movie.overview;
      this.isTooLong = false;
  }
}
