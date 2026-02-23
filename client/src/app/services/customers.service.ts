import { inject, Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  
  http = inject(HttpClient);

  async loadAllCustomers(): Promise<Customer[]> {
    const customers$ = this.http.get<Customer[]>('/api/customers');

    return firstValueFrom(customers$);
  }

  async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    const customer$ =this.http.post<Customer>('/api/customers', customer);
    return firstValueFrom(customer$);
  }

  async updateCustomer(customerId: string, changes: Partial<Customer>): Promise<Customer> {
    const customer$ = this.http.patch<Customer>(`/api/customers/${customerId}`, changes);
    return firstValueFrom(customer$);
  }

  async deleteCustomer(customerId: string) {
    const deletedCustomer$ = this.http.delete(`/api/customers/${customerId}`);
    return firstValueFrom(deletedCustomer$);
  }
}
