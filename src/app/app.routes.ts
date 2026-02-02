import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Production } from './components/production/production';
import { Supply } from './components/supply/supply';
import { Customers } from './components/customers/customers';
import { ListOfOrders } from './components/list-of-orders/list-of-orders';
import { CreateOrder } from './components/create-order/create-order';

export const routes: Routes = [
    {path: 'home', component: Home},
    {path: 'customers', component: Customers},
    {path: 'production', component: Production},
    {path: 'supply', component: Supply},
    {path: 'orders/:customerId', component: ListOfOrders},
    {path: 'orders/create/:customerId', component: CreateOrder}

];
