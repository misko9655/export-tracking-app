import { Component, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { openEditOrderDialog } from '../edit-order-dialog/edit-order-dialog';
import { MatDialog } from '@angular/material/dialog';
import { Order } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrdersCardList } from '../orders-card-list/orders-card-list';

@Component({
  selector: 'app-orders',
  imports: [
    MatButtonModule,
    MatIconModule,
    OrdersCardList
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  orders = signal<Order[]>([]);
  ordersService = inject(OrdersService);
  private route = inject(ActivatedRoute);
  private customerId = signal<string>(this.route.snapshot.params['customerId']);
  dialog = inject(MatDialog);

  constructor() {
    effect(() => {
      console.log('Customer ID from route:', this.customerId());
    });

    this.loadOrders()
      .then(() => console.log('Orders loaded successfully', this.orders()));
  }

  async loadOrders() {
    try{
      const orders = await this.ordersService.loadAllOrders(this.customerId());
      this.orders.set(orders)
    }
    catch(error) {
      console.error('Error loading orders:', error);
    }
  }
  
  async onAddOrder() {
    const newOrder = await openEditOrderDialog(
      this.dialog,
      {
        title: 'Dodaj novo trebovanje',
        mode: 'create',
        customerId: this.customerId()
      }
    );

    if (!newOrder) {
      return;
    }

    const newOrders = [...this.orders(), newOrder];
    this.orders.set(newOrders);
  }

  onOrderUpdated(updatedOrder: Order) {
    const tempOrders = this.orders();
    const newOrders = tempOrders.map(order => (
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    this.orders.set(newOrders);
  }

  async onOrderDeleted(orderId: string) {
    try {
      await this.ordersService.deleteOrder(orderId);
      const tempOrders = this.orders();
      const newOrders = tempOrders.filter(order => order.id !== orderId);
      this.orders.set(newOrders);
    }
    catch (error) {
      console.error('Error deleting order:', error);
    }
  }
}
