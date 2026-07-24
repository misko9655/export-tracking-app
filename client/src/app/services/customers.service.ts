import { inject, Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {

  http = inject(HttpClient);

  // Keširano dok se neko ne izmeni - poziv se invalidira iz mutacija ispod i
  // iz komponente kad stigne realtime 'customer' event (isti princip kao
  // RawMaterialAllocationService.getGlobalAllocation()).
  private cached: Promise<Customer[]> | null = null;

  async loadAllCustomers(): Promise<Customer[]> {
    if (!this.cached) {
      this.cached = firstValueFrom(this.http.get<Customer[]>('/api/customers'))
        .catch(err => { this.cached = null; throw err; });
    }
    return this.cached;
  }

  invalidate() {
    this.cached = null;
  }

  async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    const customer$ =this.http.post<Customer>('/api/customers', customer);
    const created = await firstValueFrom(customer$);
    this.invalidate();
    return created;
  }

  async updateCustomer(customerId: string, changes: Partial<Customer>): Promise<Customer> {
    const customer$ = this.http.patch<Customer>(`/api/customers/${customerId}`, changes);
    const updated = await firstValueFrom(customer$);
    this.invalidate();
    return updated;
  }

  async deleteCustomer(customerId: string) {
    const deletedCustomer$ = this.http.delete(`/api/customers/${customerId}`);
    const result = await firstValueFrom(deletedCustomer$);
    this.invalidate();
    return result;
  }
}
