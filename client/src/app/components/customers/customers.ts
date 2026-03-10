import { Component, effect, inject, signal } from '@angular/core';
import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomersCardList } from '../customers-card-list/customers-card-list';
import { MatDialog } from '@angular/material/dialog';
import { openEditCustomerDialog } from '../edit-customer-dialog/edit-customer-dialog';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-customers',
  imports: [
    CustomersCardList,
    MatButtonModule,
    MatIconModule,
],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers {

  customers = signal<Customer[]>([]);
  customersService = inject(CustomersService);
  dialog = inject(MatDialog);
  messagesService = inject(MessagesService);

  constructor() {
    effect(() => {
      console.log('Customers signal value:', this.customers());
    });
    this.loadCustomers()
      .then(() => console.log('Customers loaded successfully', this.customers()));
  }

  async loadCustomers() {

    try {
      const customers = await this.customersService.loadAllCustomers();
      this.customers.set(customers);
    }
      catch (error) {
        this.messagesService.showMessage('Error loading customers', 'error');
        console.error('Error loading customers:', error);
      }
  }

  onCustomerUpdated(updatedCustomer: Customer) {
    const tempCustomers = this.customers();
    const newCustomers = tempCustomers.map(customer => (
      customer.id === updatedCustomer.id ? updatedCustomer : customer
    ));

    console.log('Updating customer list with xxx:', updatedCustomer);
    this.customers.set(newCustomers);
  }

  async onCustomerDeleted(customerId: string) {
    try {
      await this.customersService.deleteCustomer(customerId);
      const tempCustomers = this.customers();
      const newCustomers = tempCustomers.filter(customer => customer.id !== customerId);
      this.customers.set(newCustomers);
    }
    catch (error) {
      console.error('Error deleting customer:', error);
    }
  }

  async onAddCustomer() {
    const newCustomer = await openEditCustomerDialog(
      this.dialog,
      {
        mode: 'create',
        title: 'Dodaj novog kupca',
      }
    );
    if(!newCustomer) {
      return;
    }
    const newCustomers = [...this.customers(), newCustomer];
    this.customers.set(newCustomers);
  }
}
