import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Customers } from './components/customers/customers';
import { Orders } from './components/orders/orders';


export const routes: Routes = [
    {path: 'home', component: Home},
    {path: 'customers', component: Customers},
    {path: 'orders/:customerId', component: Orders},
    // { path: '', redirectTo: '/home', pathMatch: 'full' }, // Optional: redirect empty path
    // { path: '**', redirectTo: '/home' } // Wildcard route - catches all undefined paths
];
