import { Component, effect, inject, input, output } from '@angular/core';
import { OrderItem } from '../../models/order-item.model';
import { MatDialog } from '@angular/material/dialog';
import { openEditOrderItemDialog } from '../edit-order-item-dialog/edit-order-item-dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { openConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { DatePipe } from '@angular/common';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-order-items-table',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    DatePipe
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'sr-Latn'}
  ],
  templateUrl: './order-items-table.html',
  styleUrl: './order-items-table.scss',
})
export class OrderItemsTable {
  orderItems = input.required<OrderItem[]>();
  orderItemUpdated = output<OrderItem>();
  orderItemDeleted = output<string>();

  dialogForConfirmation = inject(MatDialog);

  dialog = inject(MatDialog);
  displayedColumns = [
    'productCode', 
    'productName', 
    'unitOfMeasure', 
    'unitsInTransportBox', 
    'orderedQuantityTp',
    'readyQuantity',
    'lot',
    'dateOfExpire', 
    'actions'
  ]

  constructor() {
    effect(() => {
      console.log('Order items: ', this.orderItems());
    })
  }

  async onEditOrderItem(orderItem: OrderItem, flag: string) {
    const updatedOrderItem = await openEditOrderItemDialog(
      this.dialog,
      {
        mode: 'edit',
        orderId: orderItem.orderId,
        orderItem,
        title: 'Izmeni podatke',
        addFlag: flag
      }
    )
    if(updatedOrderItem) {
      this.orderItemUpdated.emit(updatedOrderItem);
    }

  }

  async onDeleteOrderItem(orderItemId: string) {
    const confirmation = await openConfirmationDialog(
          this.dialogForConfirmation,
          {
            message: 'Da li ste sigurni da želite da obrišete artikal sa trebovanja?',
            title: 'Potvrdi akciju'
          }
        );
        if(confirmation) {
          this.orderItemDeleted.emit(orderItemId);
        }
  }
}
