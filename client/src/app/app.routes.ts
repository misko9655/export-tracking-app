import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Customers } from './components/customers/customers';
import { Orders } from './components/orders/orders';
import { OrderDetails } from './components/order-details/order-details';
import { Production } from './components/production/production';
import { Supply } from './components/supply/supply';
import { Login } from './components/login/login';
import { isUserAuthenticated } from './guards/auth.guard';
import { isSuperAdmin } from './guards/super-admin.guard';
import { pageAccessGuard } from './guards/page-access.guard';
import { Lager } from './components/lager/lager';
import { ArtikliLogistika } from './components/artikli-logistika/artikli-logistika';
import { Dashboard } from './components/dashboard/dashboard';


export const routes: Routes = [
    {path: 'home', component: Home, canActivate: [isUserAuthenticated]},
    {path: 'customers', component: Customers, canActivate: [isUserAuthenticated, pageAccessGuard('customers')]},
    {path: 'orders/:customerId', component: Orders, canActivate: [isUserAuthenticated, pageAccessGuard('customers')]},
    {path: 'order-details/:orderId', component: OrderDetails, canActivate: [isUserAuthenticated, pageAccessGuard('customers')]},
    {path: 'production', component: Production, canActivate: [isUserAuthenticated, pageAccessGuard('production')]},
    {path: 'supply', component: Supply, canActivate: [isUserAuthenticated, pageAccessGuard('supply')]},
    {path: 'supply/:orderId', component: Supply, canActivate: [isUserAuthenticated, pageAccessGuard('supply')]},
    {path: 'lager', component: Lager, canActivate: [isUserAuthenticated, pageAccessGuard('lager')]},
    {path: 'artikli-logistika', component: ArtikliLogistika, canActivate: [isUserAuthenticated, pageAccessGuard('artikliLogistika')]},
    {path: 'dashboard', component: Dashboard, canActivate: [isUserAuthenticated, isSuperAdmin]},
    {path: 'login', component: Login},
    { path: '', redirectTo: '/home', pathMatch: 'full' }, // Optional: redirect empty path
    { path: '**', redirectTo: '/home' } // Wildcard route - catches all undefined paths
];
