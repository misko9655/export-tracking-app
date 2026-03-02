import { Component, inject, input, output } from '@angular/core';
import { Customer } from '../../models/customer.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { openEditCustomerDialog } from '../edit-customer-dialog/edit-customer-dialog';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customers-card-list',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './customers-card-list.html',
  styleUrl: './customers-card-list.scss',
})
export class CustomersCardList {
  customers = input.required<Customer[]>();

  customerUpdated = output<Customer>();
  customerDeleted = output<string>();

  router = inject(Router);

  dialog = inject(MatDialog);

  async onEditCustomer(customer: Customer) {
    const updatedCustomer = await openEditCustomerDialog(
      this.dialog, 
      {
        mode: 'edit',
        title: `Izmeni podatke: ${customer.name}`,
        customer
      }
    );
    if (updatedCustomer) {
      this.customerUpdated.emit(updatedCustomer);
    }
  }

  async onDeleteCustomer(customer: Customer) {
    this.customerDeleted.emit(customer.id);
  }

  goToCustomerOrders(customerId: string) {
    this.router.navigate(['/orders', customerId]);
  }
}
