import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../login/auth.service';
import {Movie, Movie2} from '../../shared/movie';
import {SelectedMovieService} from '../../API/selected-movie.service';
import {IonItemSliding, NavController} from '@ionic/angular';
import {MovieAPIService} from '../../API/movie-api.service';
import {FirebaseService} from '../firebase.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-seen',
  templateUrl: './seen.page.html',
  styleUrls: ['./seen.page.scss'],
})
export class SeenPage implements OnInit {
  private seenBefore: Movie[] = [];
  private dispalyMovies = [];
  private genres = {};
  constructor(
      private auth: AuthService,
      private selectedMovie: SelectedMovieService,
      private navController: NavController,
      private movieService: MovieAPIService,
      private firebase: FirebaseService,
  ) {


  }

  movies$;
  ngOnInit() {
    console.log('seen movies ngOnInit Called');
    this.movies$ = this.firebase.getHasSeen();
    // if(this.auth.getUserInfo().name === ''){
    //   this.auth.refreshUserInfo().subscribe(dbUserData =>{
    //     // @ts-ignore
    //     this.auth.updateUserMovieList(dbUserData.mlHasSeen, dbUserData.mlNotSeen);
    //     // console.log('checking for movies you have not seen');
    //     // console.log(this.auth.getUserInfo());
    //     this.seenBefore = this.auth.getUserInfo().mlHasSeen;
    //     // console.log('seen before is: ');
    //     // console.log(this.seenBefore);
    //     this.fillOutMovies();
    //   });
    // }
    // else{
    //   this.seenBefore = this.auth.getUserInfo().mlHasSeen;
    //   this.fillOutMovies();
    // }
  }

  goToMovie(movieID: number) {
    console.log(movieID);
    this.selectedMovie.movieId = movieID;
    this.navController.navigateForward('details');
  }

  // fillOutMovies(){
  //   // console.log('fill out movies called');
  //   this.dispalyMovies = [];
  //   // console.log(`seen before length is: ${this.seenBefore.length}`);
  //   for(let i: number = 0; i < this.seenBefore.length; i++){
  //     // console.log(`calling movie details for ${this.seenBefore[i].title}`);
  //     this.getMovieDetail(this.seenBefore[i].movieID, this.seenBefore[i].title);
  //   }
  // }
  // getMovieDetail(movieID: number,movieTitle: string){
  //   // console.log('get movie details called');
  //   this.movieService.getMovieDetail(movieID).subscribe(movieData =>{
  //     let result = {
  //       // @ts-ignore
  //       pic: movieData.poster_path,
  //       // @ts-ignore
  //       genres: movieData.genres,
  //       title: movieTitle,
  //       movieID: movieID
  //     };
  //     this.dispalyMovies.push(result);
  //     console.log(this.dispalyMovies);
  //   })
  // }

  removeItem(slidingItem: IonItemSliding, movieId) {
    slidingItem.closeOpened();
    this.firebase.removeHasSeen(movieId).then(_ => {
      slidingItem.closeOpened();
    });
    // this.fillOutMovies();
    // slidingItem.close();
  }

}
