import { Component, inject } from '@angular/core';
import { CartService } from '../../../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../shared/models/User';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  cartQty = 0;
  cartService = inject(CartService);
  user !: User;

  constructor(private userService: UserService) {
    this.cartService.getCartObservable().subscribe((cart) => {
      this.cartQty = cart.totalCount;
    });

    this.userService.userObservable.subscribe((user) => {
      this.user = user;
    });
  }

  logOut() {
    this.userService.logout();
  }

  get IsAuth() {
    return this.user.token;
  }
}
