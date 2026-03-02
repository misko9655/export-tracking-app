import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EditCustomerDialogData } from '../../models/edit-customer-dialog-data.model';
import { firstValueFrom } from 'rxjs';
import { isActive } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-edit-customer-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonToggleModule
  ],
  templateUrl: './edit-customer-dialog.html',
  styleUrl: './edit-customer-dialog.scss',
})
export class EditCustomerDialog {
  customersService = inject(CustomersService);
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef);
  data: EditCustomerDialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: [''],
    country: [''],
    deliveryAddress: [''],
    isActive: [true]
  });

  constructor() {
    this.form.patchValue({
      name: this.data.customer?.name || '',
      country: this.data.customer?.country || '',
      deliveryAddress: this.data.customer?.deliveryAddress || '',
      isActive: this.data.customer ? this.data.customer?.isActive : true
    });
  }

  async onSave() {
    const customerProps = this.form.value as Partial<Customer>;
    if (this.data.mode === 'edit') {
      await this.updateCustomer(this.data?.customer!.id, customerProps);
    }
    else if(this.data.mode === 'create') {
      await this.createCustomer(customerProps);
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  async createCustomer(customer: Partial<Customer>) {
    try {
      const createdCustomer = await this.customersService.createCustomer(customer);
      console.log('Customer created successfully:', createdCustomer);
      this.dialogRef.close(createdCustomer);
    }
    catch (error) {
      console.error('Error creating customer:', error);
      alert('Došlo je do greške prilikom kreiranja kupca. Molimo pokušajte ponovo.'); 
    }
  }

  async updateCustomer(customerId: string, changes: Partial<Customer>) {
    try {
      const updatedCustomer = await this.customersService.updateCustomer(customerId, changes);
      console.log('Customer updated successfully:', updatedCustomer);
      this.dialogRef.close(updatedCustomer);
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Došlo je do greške prilikom ažuriranja kupca. Molimo pokušajte ponovo.'); 
    }
  }
}

export async function openEditCustomerDialog(dialog: MatDialog, data: EditCustomerDialogData) {
  const config = new MatDialogConfig<EditCustomerDialogData>();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  config.data = data;

  const close$ = dialog.open(EditCustomerDialog, config)
    .afterClosed();

  return firstValueFrom(close$); 
}
