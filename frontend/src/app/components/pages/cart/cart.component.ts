import { Component, inject } from '@angular/core';
import { Cart } from '../../../shared/models/Cart';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../shared/models/CartItem';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotFoundComponent } from "../../partials/not-found/not-found.component";
import { TitleComponent } from "../../partials/title/title.component";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, NotFoundComponent, TitleComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cart!: Cart;
  cartService = inject(CartService);

  constructor() {
    this.cartService.getCartObservable().subscribe((cart) => {
      this.cart = cart;
    });
  }

  removeFromCart(cartItem: CartItem) {
    this.cartService.removeFromCart(cartItem.food.id);
  }

  changeQuantity(cartItem: CartItem, qty: string) {
    const quantity = parseInt(qty);

    this.cartService.changeQuantity(cartItem.food.id, quantity);
  }
}
