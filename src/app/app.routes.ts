import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ExportOrder } from './components/export-order/export-order';
import { Production } from './components/production/production';
import { Supply } from './components/supply/supply';
import { Items } from './components/items/items';

export const routes: Routes = [
    {path: 'home', component: Home},
    {path: 'export_orders', component: ExportOrder},
    {path: 'production', component: Production},
    {path: 'supply', component: Supply},
    {path: 'items', component: Items}

];
