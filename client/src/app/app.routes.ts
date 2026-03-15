import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Customers } from './components/customers/customers';
import { Orders } from './components/orders/orders';
import { OrderDetails } from './components/order-details/order-details';
import { Production } from './components/production/production';
import { Supply } from './components/supply/supply';


export const routes: Routes = [
    {path: 'home', component: Home},
    {path: 'customers', component: Customers},
    {path: 'orders/:customerId', component: Orders},
    {path: 'order-details/:orderId', component: OrderDetails},
    {path: 'production', component: Production},
    {path: 'supply/:orderId', component: Supply},
    // { path: '', redirectTo: '/home', pathMatch: 'full' }, // Optional: redirect empty path
    // { path: '**', redirectTo: '/home' } // Wildcard route - catches all undefined paths
];
