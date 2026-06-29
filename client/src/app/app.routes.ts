import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Customers } from './components/customers/customers';
import { Orders } from './components/orders/orders';
import { OrderDetails } from './components/order-details/order-details';
import { Production } from './components/production/production';
import { Supply } from './components/supply/supply';
import { RawMaterials } from './components/raw-materials/raw-materials';
import { Login } from './components/login/login';
import { isUserAuthenticated } from './guards/auth.guard';
import { Lager } from './components/lager/lager';
import { Normativi } from './components/normativi/normativi';
import { NormativDetail } from './components/normativ-detail/normativ-detail';


export const routes: Routes = [
    {path: 'home', component: Home, canActivate: [isUserAuthenticated]},
    {path: 'customers', component: Customers, canActivate: [isUserAuthenticated]},
    {path: 'orders/:customerId', component: Orders, canActivate: [isUserAuthenticated]},
    {path: 'order-details/:orderId', component: OrderDetails, canActivate: [isUserAuthenticated]},
    {path: 'production', component: Production, canActivate: [isUserAuthenticated]},
    {path: 'supply', component: Supply, canActivate: [isUserAuthenticated]},
    {path: 'supply/:orderId', component: Supply, canActivate: [isUserAuthenticated]},
    {path: 'raw-materials', component: RawMaterials, canActivate: [isUserAuthenticated]},
    {path: 'lager', component: Lager, canActivate: [isUserAuthenticated]},
    {path: 'normativi', component: Normativi, canActivate: [isUserAuthenticated]},
    {path: 'normativi/:id', component: NormativDetail, canActivate: [isUserAuthenticated]},
    {path: 'login', component: Login},
    { path: '', redirectTo: '/home', pathMatch: 'full' }, // Optional: redirect empty path
    { path: '**', redirectTo: '/home' } // Wildcard route - catches all undefined paths
];
