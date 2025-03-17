import { Component, inject } from '@angular/core';
import { Food } from '../../../shared/models/Food';
import { FoodService } from '../../../services/food.service';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { StarRatingComponent } from '../../partials/star-rating/star-rating.component';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { NotFoundComponent } from "../../partials/not-found/not-found.component";

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent, NotFoundComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent {
  food!: Food;
  route: ActivatedRoute = inject(ActivatedRoute);
  foodService = inject(FoodService);
  cartService = inject(CartService);

  constructor(private router: Router) {
    this.route.params.subscribe((params) => {
      if(params['id'])
      this.foodService.getFoodById(params['id']).subscribe((serverFood) => {
        this.food = serverFood;
      });
    });
  }

  addToCart() {
    this.cartService.addToCart(this.food);
    this.router.navigateByUrl("/shopping-cart");
  }
}
