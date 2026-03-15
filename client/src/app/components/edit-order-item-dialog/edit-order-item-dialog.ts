import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OrderItemsService } from '../../services/order-items.service';
import { EditOrderItemDialogData } from '../../models/edit-order-item-dialog-data.model';
import { OrderItem } from '../../models/order-item.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-order-item-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './edit-order-item-dialog.html',
  styleUrl: './edit-order-item-dialog.scss',
})
export class EditOrderItemDialog {
  orderItemsService = inject(OrderItemsService);
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef);
  data: EditOrderItemDialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    productCode: [''],
    numberOfOrderedTp: [0],
    numberOfReadyTp: [0]
  });

  constructor() {
    this.form.patchValue({
      productCode: this.data.orderItem?.productCode || '',
      numberOfOrderedTp: this.data.orderItem?.numberOfOrderedTp || 0,
      numberOfReadyTp: this.data.orderItem?.numberOfReadyTp || 0,
    });
  }

  onSave() {
    const orderItemProps = this.form.value as Partial<OrderItem>;
    orderItemProps.orderId = this.data.orderId;

    if(this.data.mode === 'edit') {
      this.updateOrderItem(this.data.orderItem!.id, orderItemProps);
    }
    else if(this.data.mode === 'create') {
      this.createOrderItem(orderItemProps);
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  async createOrderItem(orderItem: Partial<OrderItem>) {
    try {
      const createdOrderItem = await this.orderItemsService.createOrderItem(orderItem);
      console.log('Created order item:', createdOrderItem);
      this.dialogRef.close(createdOrderItem);
    }
    catch(error) {
      console.error('Error creating order item:', error);
      alert('Došlo je do greške prilikom kreiranja trebovanog artikla. Molimo pokušajte ponovo.');
    }
  }
  
  async updateOrderItem(orderItemId: string, changes: Partial<OrderItem>) {
    try {
      const updatedOrderItem = await this.orderItemsService.updateOrderItem(orderItemId, changes);
      console.log('Updated order item:', updatedOrderItem);
      this.dialogRef.close(updatedOrderItem);
    }
    catch(error) {
      console.error('Error updating order item:', error);
      alert('Doslo je do greške prilikom ažuriranja trebovanog artikla. Molimo pokušajte ponovo.');
    }
  }
}

export async function openEditOrderItemDialog(dialog: MatDialog, data: EditOrderItemDialogData) {
  const config = new MatDialogConfig<EditOrderItemDialogData>();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  config.data = data;

  const close$ = dialog.open(EditOrderItemDialog, config)
    .afterClosed();

  return firstValueFrom(close$);
}
