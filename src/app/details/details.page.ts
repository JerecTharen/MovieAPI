import { Component, OnInit } from '@angular/core';
import {MovieAPIService} from "../API/movie-api.service";
import {ActivatedRoute} from "@angular/router";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {SelectedMovieService} from "../API/selected-movie.service";

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  get movieId(): number {
    return this.selectedMovie.movieId;
  }

  constructor(private movieApi: MovieAPIService, public sanitizer: DomSanitizer, private selectedMovie: SelectedMovieService) { }
  id = this.movieId;
  movie$;
  private url: string;
  video: SafeResourceUrl;
  ngOnInit() {
    this.movie$ = this.movieApi.getMovieDetail(this.id);
    this.movieApi.getMovieVideo(this.id).subscribe(data => {
        this.url = `https://www.youtube.com/embed/?controls=0&showinfo=0&rel=0`;
        this.video = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    });

  }

}
