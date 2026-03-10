import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../models/order.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { OrderItem } from '../../models/order-item.model';
import { MatDialog } from '@angular/material/dialog';
import { openEditOrderItemDialog } from '../edit-order-item-dialog/edit-order-item-dialog';
import { OrderItemsService } from '../../services/order-items.service';
import { OrderItemsTable } from '../order-items-table/order-items-table';

@Component({
  selector: 'app-order-details',
  imports: [
    MatCardModule,
    MatIconModule,
    DatePipe,
    MatButtonModule,
    DatePipe,
    OrderItemsTable
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss',
})
export class OrderDetails {
  private route = inject(ActivatedRoute);
  private orderId = signal<string>(this.route.snapshot.params['orderId']);
  private ordersService = inject(OrdersService);
  private orderItemsService = inject(OrderItemsService);
  order = signal<Order | null>(null);
  orderItems = signal<OrderItem[]>([]);
  dialog = inject(MatDialog);



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
        const orderItems = await this.orderItemsService.loadAllOrderItems(this.orderId());
        this.orderItems.set(orderItems);
      }
      catch(error) {
        console.error('Error loading order: ', error);
      }
  }

  async addOrderItem() {
    const newOrderItem = await openEditOrderItemDialog(
      this.dialog,
      {
        title: 'Dodaj artikal',
        mode: 'create',
        orderId: this.orderId()
      }
    );

    if(!newOrderItem) {
      return;
    }

    const newOrderItems = [...this.orderItems(), newOrderItem];
    this.orderItems.set(newOrderItems);
  }

  async onOrderItemUpdated(updatedOrderItem: OrderItem) {
    const tempOrderItems = this.orderItems();
    const newOrderItems = tempOrderItems.map(orderItem => (
      orderItem.id === updatedOrderItem.id ? updatedOrderItem : orderItem
    ));
    this.orderItems.set(newOrderItems);
  }

  async onOrderItemDeleted(orderItemId: string) {
    try {
      await this.orderItemsService.deleteOrderItem(orderItemId);
      const tempOrderItems = this.orderItems();
      const newOrderItems = tempOrderItems.filter(orderItem => (orderItemId !== orderItem.id));
      this.orderItems.set(newOrderItems);
    }
    catch(error) {
      console.error('Error deleting order item:', error);
    }
  }

  checkSupply(orderId: string) {

  }
}
