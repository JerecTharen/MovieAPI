import { Component, OnInit } from '@angular/core';
import {CommentsService} from '../../login/comments.service';
import {SelectedMovieService} from '../../API/selected-movie.service';
import {MovieAPIService} from '../../API/movie-api.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {Comment} from '../../shared/comment';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.page.html',
  styleUrls: ['./comments.page.scss'],
})
export class CommentsPage implements OnInit {

  constructor(private commentsService: CommentsService,
              private selectedMovie: SelectedMovieService,
              private movieApi: MovieAPIService,
              private afAuth: AngularFireAuth) { }

  movieComments;
  id;
  movie;
  authenticated;
  userComment;

  get movieId(): number {
    return this.selectedMovie.movieId;
  }

  ngOnInit() {
    this.id = this.movieId;
    this.movieApi.getMovieDetail(this.id).subscribe(data => {
      this.movie = data;
      this.authenticated = !!this.afAuth.auth.currentUser.uid;
      this.movieComments = this.commentsService.getCommentsFor(this.id);
      this.getUserComment();
    });


  }

  getUserComment() {
    this.commentsService.getUserComment(this.id, this.afAuth.auth.currentUser.uid).subscribe(docSnapshot => {
      // @ts-ignore
      this.userComment = docSnapshot.comment;
    });
  }

  postComment(comment) {
    console.log(comment.value);
    let commentData: Comment = {
      userID: this.afAuth.auth.currentUser.uid,
      comment: comment.value,
    };

    this.commentsService.addMovie(this.movie, commentData);
  }

}
