import { Routes } from '@angular/router';
import { isUserAuthenticated } from './guards/auth.guard';
import { isSuperAdmin } from './guards/super-admin.guard';
import { pageAccessGuard } from './guards/page-access.guard';


export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./components/home/home').then(m => m.Home),
        canActivate: [isUserAuthenticated]
    },
    {
        path: 'customers',
        loadComponent: () => import('./components/customers/customers').then(m => m.Customers),
        canActivate: [isUserAuthenticated, pageAccessGuard('customers')]
    },
    {
        path: 'orders/:customerId',
        loadComponent: () => import('./components/orders/orders').then(m => m.Orders),
        canActivate: [isUserAuthenticated, pageAccessGuard('customers')]
    },
    {
        path: 'order-details/:orderId',
        loadComponent: () => import('./components/order-details/order-details').then(m => m.OrderDetails),
        canActivate: [isUserAuthenticated, pageAccessGuard('customers')]
    },
    {
        path: 'production',
        loadComponent: () => import('./components/production/production').then(m => m.Production),
        canActivate: [isUserAuthenticated, pageAccessGuard('production')]
    },
    {
        path: 'supply',
        loadComponent: () => import('./components/supply/supply').then(m => m.Supply),
        canActivate: [isUserAuthenticated, pageAccessGuard('supply')]
    },
    {
        path: 'supply/:orderId',
        loadComponent: () => import('./components/supply/supply').then(m => m.Supply),
        canActivate: [isUserAuthenticated, pageAccessGuard('supply')]
    },
    {
        path: 'lager',
        loadComponent: () => import('./components/lager/lager').then(m => m.Lager),
        canActivate: [isUserAuthenticated, pageAccessGuard('lager')]
    },
    {
        path: 'artikli-logistika',
        loadComponent: () => import('./components/artikli-logistika/artikli-logistika').then(m => m.ArtikliLogistika),
        canActivate: [isUserAuthenticated, pageAccessGuard('artikliLogistika')]
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [isUserAuthenticated, isSuperAdmin]
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login').then(m => m.Login)
    },
    { path: '', redirectTo: '/home', pathMatch: 'full' }, // Optional: redirect empty path
    { path: '**', redirectTo: '/home' } // Wildcard route - catches all undefined paths
];
