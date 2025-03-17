import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { DetailComponent } from './components/pages/detail/detail.component';
import { CartComponent } from './components/pages/cart/cart.component';
import { LoginComponent } from './components/pages/login/login.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { CheckoutComponent } from './components/pages/checkout/checkout.component';
import { authGuard } from './auth/guards/auth.guard';
import { PaymentComponent } from './components/pages/payment/payment.component';
import { OrderTrackComponent } from './components/pages/order-track/order-track.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, title: 'Home page', },
    { path: 'search/:filter', component: HomeComponent },
    { path: 'tags/:tag', component:HomeComponent },
    { path: 'foods/:id', component: DetailComponent },
    { path: 'shopping-cart', component: CartComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
    { path: 'payment', component: PaymentComponent, canActivate: [authGuard] },
    { path: 'track/:orderId', component: OrderTrackComponent, canActivate: [authGuard] }
];
