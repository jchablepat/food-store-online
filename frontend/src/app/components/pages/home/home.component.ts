import { Component, inject } from '@angular/core';
import { Food } from '../../../shared/models/Food';
import { FoodService } from '../../../services/food.service';
import { CommonModule } from '@angular/common';
import { StarRatingComponent } from '../../partials/star-rating/star-rating.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SearchComponent } from "../../partials/search/search.component";
import { TagsComponent } from '../../partials/tags/tags.component';
import { NotFoundComponent } from "../../partials/not-found/not-found.component";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent, SearchComponent, TagsComponent, NotFoundComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  foods: Food[] = [];
  currentRating: number = 0;
  route:ActivatedRoute = inject(ActivatedRoute);

  constructor(foodService: FoodService) {
    let foodsObservable: Observable<Food[]>;

    this.route.params.subscribe((params) => {
      if(params['filter'])
        foodsObservable = foodService.getAllFoodsBySearchTerm(params['filter']);
      else if(params['tag'])
        foodsObservable = foodService.getAllFoodsByTag(params['tag']); 
      else
        foodsObservable = foodService.getAll();

        foodsObservable.subscribe((serverFoods) => {
          this.foods = serverFoods;
        });
    });
  }

  onRatingChange(rating: number) {
    this.currentRating = rating;
  }
}
