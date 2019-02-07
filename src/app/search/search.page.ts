import { Component, OnInit } from '@angular/core';
import { MovieAPIService } from '../API/movie-api.service';
import { SelectedMovieService } from '../API/selected-movie.service';
import { LoadingController } from '@ionic/angular';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderFixService } from '../shared/loader-fix.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  constructor(
    private movieService: MovieAPIService,
    private selectedMovie: SelectedMovieService,
    private router: Router,
    private loader: LoadingController,
    private route: ActivatedRoute,
    private loadingService: LoaderFixService
  ) { }

  topRatedList;
  search: string;
  searchResults;
  genres = {};
  genreFilter;

  ngOnInit() {
    this.movieService.getTopRated(1).subscribe(list => {
      this.topRatedList = list['results'];
      if (!this.searchResults) { this.searchResults = this.topRatedList; }
    });
    this.movieService.getgenreIds().subscribe(list => {
      const gen = list['genres'];
      this.genres = _.mapKeys(gen, 'id');
    });

  }

  Search(element) {
    if (element.value === '') {
      this.searchResults = this.topRatedList;
    } else {
      this.movieService.searchMovies(element.value).subscribe(data => {
        this.searchResults = data['results'];
      });
    }

  }

  async goToDetails(movieId) { // add async for loader
    this.loadingService.isLoading();
    const loading = await this.loader.create({
    });
    loading.present().then( _ => {
      this.router.navigate(['details', movieId]);
    });
  }

}
