import { Component } from '@angular/core';
import { Order } from '../../../shared/models/Order';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { CommonModule } from '@angular/common';
import { OrderItemsListComponent } from "../../partials/order-items-list/order-items-list.component";
import { MapComponent } from '../../partials/map/map.component';
import { TitleComponent } from "../../partials/title/title.component";

@Component({
  selector: 'app-order-track',
  standalone: true,
  imports: [CommonModule, OrderItemsListComponent, MapComponent, TitleComponent],
  templateUrl: './order-track.component.html',
  styleUrl: './order-track.component.css'
})
export class OrderTrackComponent {
  order !: Order;

  constructor(
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService
  ) {
    const orderId = this.activatedRoute.snapshot.params['orderId'];
    if (!orderId) {
      return;
    }

    this.orderService.trackOrderById(orderId).subscribe((order) => {
      this.order = order;
    });
  }
}
