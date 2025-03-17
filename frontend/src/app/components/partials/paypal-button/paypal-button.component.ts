import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Order } from '../../../shared/models/Order';
import { OrderService } from '../../../services/order.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../../services/cart.service';

// window.paypal.Buttons().render('#paypal-button-container');
// Declare the paypal variable
declare var paypal: any;

@Component({
  selector: 'paypal-button',
  standalone: true,
  imports: [],
  templateUrl: './paypal-button.component.html',
  styleUrl: './paypal-button.component.css'
})
export class PaypalButtonComponent implements OnInit {
  @Input() order !: Order;
  @ViewChild('paypalButtonCtr', { static: true })
  paypaylElement!: ElementRef;


  constructor(
    private orderService : OrderService,
    private router : Router,
    private toastrService : ToastrService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const self = this; // Fix because, this is not available inside the paypal.Buttons() function

    // Create a new PayPal button
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: self.order.totalPrice,
            }
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        const payment = await actions.order.capture();
        this.order.paymentId = payment.id;

        self.orderService.pay(this.order).subscribe({
          next: (orderId) => {
            this.cartService.clearCart();
            this.router.navigateByUrl('/track/' + orderId);
            this.toastrService.success('Payment saved successful!', 'Success');
          },
          error: () => {
            this.toastrService.error('Error ocurred while paying!', 'Payment failed');
          }
        });
      },
      onError: (err: any) => {
        this.toastrService.error('Error ocurred while paying!', 'Paypal error');
        console.log(err);
      }
    })
    .render(this.paypaylElement.nativeElement);
  }
}
