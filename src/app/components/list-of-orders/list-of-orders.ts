import { Component, inject } from '@angular/core';
import { Card } from '../card/card';
import { OrderService } from '../../services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Order } from '../../../../shared/order';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-list-of-orders',
  imports: [
    Card,
    AsyncPipe,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './list-of-orders.html',
  styleUrl: './list-of-orders.css',
})
export class ListOfOrders {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  orders$: Observable<Order[]>;
  customerId!: string;

  constructor() {
    console.log('test');
    this.customerId = this.route.snapshot.params['customerId']
    this.orders$ = this.orderService.findCustomerOrders(this.customerId);
  }

  goToOrderItems(orderId: string) {

  }

  createOrder() {
    this.router.navigate(['/orders', 'create', this.customerId]);
  }

}
