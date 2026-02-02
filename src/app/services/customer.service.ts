import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Customer } from '../../../shared/customer'
import { Order } from '../../../shared/order'

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http:HttpClient) {}

  findAllCustomers(): Observable<Customer[]> {
    return this.http.get('/api/customers', {responseType: 'text'})
      .pipe(
        map(res => JSON.parse(res) as Customer[])
      );
  }

  findCustomerOrders(customerId: string): Observable<Order[]> {
    return this.http.get(`/api/orders/${customerId}`, {responseType: 'text'})
      .pipe(
        map(res => JSON.parse(res) as Order[])
      );
  }
}
