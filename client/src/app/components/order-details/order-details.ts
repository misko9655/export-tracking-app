import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-order-details',
  imports: [
    MatCardModule,
    MatIconModule,
    DatePipe,
    MatButtonModule
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss',
})
export class OrderDetails {
  private route = inject(ActivatedRoute);
  private orderId = signal<string>(this.route.snapshot.params['orderId']);
  private ordersService = inject(OrdersService);
  order = signal<Order | null>(null);

  constructor() {
    effect(() => {
      console.log(`Order Id from route: ${this.orderId()}`);
    })

    this.loadOrder()
      .then(() => {console.log('Order loaded successfully', this.order())});

  }

  async loadOrder() {
      try{
        const order = await this.ordersService.loadOrder(this.orderId());
        this.order.set(order);
      }
      catch(error) {
        console.error('Error loading order: ', error);
      }
  }

  addOrderItem() {

  }

  checkSupply(orderId: string) {

  }
}
