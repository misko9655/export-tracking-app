import { Component, inject } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OrdersService } from '../../services/orders.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EditDateDialogData } from '../../models/edit-date-dialog-data.model';
import { Order } from '../../models/order.model';
import { firstValueFrom } from 'rxjs';
import { MessagesService } from '../../services/messages.service';
import { isForbiddenError } from '../../services/error.interceptor';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-update-date-dialog',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  providers: [],
  templateUrl: './update-date-dialog.html',
  styleUrl: './update-date-dialog.scss',
})
export class UpdateDateDialog {


  ordersService = inject(OrdersService);
  messagesService = inject(MessagesService);
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef);
  data: EditDateDialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    date: [new Date()],
    comment: ['']
  });

  constructor() {
    if (this.data.mode === 'production') {
      this.form.patchValue({
        date: this.data.order?.deliveryDateFromProduction?.date ? new Date(this.data.order.deliveryDateFromProduction.date) : new Date(),
        comment: this.data.order?.deliveryDateFromProduction?.comment || ''
      });
    } else {
      this.form.patchValue({
        date: new Date(),
        comment: ''
      });
    }
  }

  onSave() {
    const orderProps = {} as Partial<Order>;
    const props = this.form.value as unknown as {date: Date, comment: string};
    if(this.data.mode === 'production') {
      orderProps.deliveryDateFromProduction = {...props};
    } else {
      orderProps.loadedOn = {...props};
      orderProps.state = 'delivered';
    }

    orderProps.customerId = this.data.customerId;

    this.updateOrder(this.data?.order!.id, orderProps);
  }

  onClose() {
    this.dialogRef.close();
  }

  async updateOrder(orderId: string, changes: Partial<Order>) {
    try {
      const updatedOrder = await this.ordersService.updateOrder(orderId, changes);
      console.log('Updated order:', updatedOrder);
      this.dialogRef.close(updatedOrder);
    }
    catch (error) {
      console.error('Error updating order:', error);
      if (!isForbiddenError(error)) {
        this.messagesService.showMessage('Došlo je do greške prilikom ažuriranja trebovanja. Molimo pokušajte ponovo.', 'error');
      }
    }
  }
}


export async function openUpdateDateDialog(dialog: MatDialog, data: EditDateDialogData) {
  const config = new MatDialogConfig<EditDateDialogData>();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  config.data = data;

  const close$ = dialog.open(UpdateDateDialog, config)
    .afterClosed();

  return firstValueFrom(close$);
}
