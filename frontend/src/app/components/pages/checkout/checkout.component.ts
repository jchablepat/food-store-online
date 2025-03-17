import { Component, OnInit } from '@angular/core';
import { Order } from '../../../shared/models/Order';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';
import { UserService } from '../../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { TextInputComponent } from "../../partials/text-input/text-input.component";
import { OrderItemsListComponent } from "../../partials/order-items-list/order-items-list.component";
import { MapComponent } from "../../partials/map/map.component";
import { OrderService } from '../../../services/order.service';
import { Router } from '@angular/router';
import { TitleComponent } from "../../partials/title/title.component";

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, OrderItemsListComponent, MapComponent, TitleComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  order : Order = new Order();
  checkOutForm !: FormGroup;

  constructor(
    cartService : CartService,
    private formBuilder : FormBuilder,
    private userService : UserService,
    private toastrService : ToastrService,
    private orderService : OrderService,
    private router : Router
  ) {
    const cart = cartService.getCart();

    this.order.items = cart.items;
    this.order.totalPrice = cart.totalPrice;
  }

  ngOnInit() : void {
    let { name, address } = this.userService.currentUser;

    this.checkOutForm = this.formBuilder.group({
      name: [ name, Validators.required ],
      address: [ address, Validators.required ]
    });
  }

  get fc() {
    return this.checkOutForm.controls;
  }

  createOrder() {
    if(this.checkOutForm.invalid) {
      this.toastrService.warning('Please fill the inputs', 'Invalid Inputs');
      return;
    }

    if(!this.order.addressLatLng) {
      this.toastrService.warning('Please select your location on the Map', 'Invalid Inputs');
      return;
    }

    this.order.name = this.fc['name'].value;
    this.order.address = this.fc['address'].value;

    this.orderService.create(this.order).subscribe({
      next: () => {
        this.router.navigateByUrl('/payment');
      },
      error: (errorResponse) => {
        this.toastrService.error(errorResponse.error, 'Cart');
      }
    });
  }
}
