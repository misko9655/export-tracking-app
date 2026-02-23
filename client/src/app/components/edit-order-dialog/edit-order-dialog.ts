import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OrdersService } from '../../services/orders.service';
import { EditOrderDialogData } from '../../models/edit-order-dialog-data.model';
import { first, firstValueFrom } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-edit-order-dialog',
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
  templateUrl: './edit-order-dialog.html',
  styleUrl: './edit-order-dialog.scss',
})
export class EditOrderDialog {
  ordersService = inject(OrdersService);
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef);
  data: EditOrderDialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    orderNo: [''],
    orderName: [''],
    orderDate: [''],
    deliveryDate: [''],
    isDelivered: [false]
  });

  constructor() {
    this.form.patchValue({
      orderNo: this.data.order?.orderNo || '',
      orderName: this.data.order?.orderName || '',
      orderDate: this.data.order?.orderDate?.toString() || new Date().toString(),
      deliveryDate: this.data.order?.deliveryDate?.toString() || new Date().toString(),
    });
  }

  onSave() {
    const orderProps = this.form.value as Partial<Order>;
    orderProps.customerId = this.data.customerId;
    if (this.data.mode === 'edit') {
      this.updateOrder(this.data?.order!._id, orderProps);
    }
    else if(this.data.mode === 'create') {
      this.createOrder(orderProps);
    }
  } 

  onClose() {
    this.dialogRef.close();
  }

  async createOrder(order: Partial<Order>) {
    try {
      const createdOrder = await this.ordersService.createOrder(order);
      console.log('Created order:', createdOrder);
      this.dialogRef.close(createdOrder);
    }
    catch(error) {
      console.error('Error creating order:', error);
      alert('Došlo je do greške prilikom kreiranja trebovanja. Molimo pokušajte ponovo.');
    }
  }

  async updateOrder(orderId: string, changes: Partial<Order>) {
    try {
      const updatedOrder = await this.ordersService.updateOrder(orderId, changes);
      console.log('Updated order:', updatedOrder);
      this.dialogRef.close(updatedOrder);
    }
    catch(error) {
      console.error('Error updating order:', error);
      alert('Došlo je do greške prilikom ažuriranja trebovanja. Molimo pokušajte ponovo.');
    }
  }
}

export async function openEditOrderDialog(dialog: MatDialog, data: EditOrderDialogData) {
  const config = new MatDialogConfig<EditOrderDialogData>();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  config.data = data;

  const close$ = dialog.open(EditOrderDialog, config)
    .afterClosed();

  return firstValueFrom(close$);
}