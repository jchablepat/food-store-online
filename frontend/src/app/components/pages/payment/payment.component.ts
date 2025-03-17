import { Component } from '@angular/core';
import { Order } from '../../../shared/models/Order';
import { OrderService } from '../../../services/order.service';
import { Router } from '@angular/router';
import { OrderItemsListComponent } from "../../partials/order-items-list/order-items-list.component";
import { MapComponent } from '../../partials/map/map.component';
import { PaypalButtonComponent } from "../../partials/paypal-button/paypal-button.component";
import { TitleComponent } from "../../partials/title/title.component";

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [OrderItemsListComponent, MapComponent, PaypalButtonComponent, TitleComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {
  order : Order = new Order();
  
  constructor(orderService : OrderService, router : Router) {
    orderService.getLatestOrder().subscribe({
      next: (order) => {
        this.order = order;
      },
      error: () => {
        router.navigateByUrl('/checkout');
      }
    })

  }
}
