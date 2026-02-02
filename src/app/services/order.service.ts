import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Order } from '../../../shared/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  findCustomerOrders(customerId: string): Observable<Order[]> {
    return this.http.get(`/api/orders/${customerId}`, {responseType: 'text'})
      .pipe(
        map(res => JSON.parse(res) as Order[])
      );
  }
}
