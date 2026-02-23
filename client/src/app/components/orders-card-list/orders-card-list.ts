import { Component, inject, input, output } from '@angular/core';
import { Order } from '../../models/order.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { openEditOrderDialog } from '../edit-order-dialog/edit-order-dialog';

@Component({
  selector: 'app-orders-card-list',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './orders-card-list.html',
  styleUrl: './orders-card-list.scss',
})
export class OrdersCardList {
  orders = input.required<Order[]>();

  orderUpdated = output<Order>();
  orderDeleted = output<string>();

  router = inject(Router);  

  dialog = inject(MatDialog);

  async onEditOrder(order: Order) {
    const updatedOrder = await openEditOrderDialog(
      this.dialog,
      {
        mode: 'edit',
        title: `Izmeni podatke: ${order.orderName}`,
        customerId: order.customerId,
        order
      }
    );

    if (updatedOrder) {
      this.orderUpdated.emit(updatedOrder);
    }
  }

  async onDeleteOrder(order: Order) {
    this.orderDeleted.emit(order._id);
  }

  goToOrderDetails(orderId: string) {
    this.router.navigate(['/order-details', orderId]);
  }
}
