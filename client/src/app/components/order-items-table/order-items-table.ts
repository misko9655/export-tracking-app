import { Component, effect, inject, input, output } from '@angular/core';
import { OrderItem } from '../../models/order-item.model';
import { MatDialog } from '@angular/material/dialog';
import { openEditOrderItemDialog } from '../edit-order-item-dialog/edit-order-item-dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-order-items-table',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [],
  templateUrl: './order-items-table.html',
  styleUrl: './order-items-table.scss',
})
export class OrderItemsTable {
  orderItems = input.required<OrderItem[]>();
  orderItemUpdated = output<OrderItem>();
  orderItemDeleted = output<string>();

  dialog = inject(MatDialog);
  displayedColumns = [
    'productCode', 
    'productName', 
    'unitOfMeasure', 
    'unitsInTransportBox', 
    'orderedQuantityTp',
    'readyQuantity', 
    'actions'
  ]

  constructor() {
    effect(() => {
      console.log('Order items: ', this.orderItems());
    })
  }

  async onEditOrderItem(orderItem: OrderItem, flag: string) {
    let quantity = orderItem.numberOfReadyTp? orderItem.numberOfReadyTp : 0;
   orderItem.numberOfReadyTp = 0;
    const updatedOrderItem = await openEditOrderItemDialog(
      this.dialog,
      {
        mode: 'edit',
        orderId: orderItem.orderId,
        orderItem,
        title: 'Izmeni podatke'
      }
    )
    if(updatedOrderItem) {
      if(flag === 'add') {
        updatedOrderItem.numberOfReadyTp += quantity;
        console.log(updatedOrderItem.numberOfReadyTp)
      } else {
        updatedOrderItem.numberOfReadyTp = quantity - updatedOrderItem.numberOfReadyTp;
      }
      this.orderItemUpdated.emit(updatedOrderItem);
    }

  }

  async onDeleteOrderItem(orderItemId: string) {
    this.orderItemDeleted.emit(orderItemId);
  }
}
