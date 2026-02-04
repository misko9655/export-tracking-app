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
        map(res => {
          console.log(res);
          return JSON.parse(res) as Order[]
        })
      );
  }

  createNewOrder(newOrder: Partial<Order>): Observable<Order> {
    return this.http.post('/api/orders', newOrder, {responseType: 'text'})
      .pipe(
        map(res => JSON.parse(res) as Order)
      )
  }

  findOrder(orderId: string): Observable<Order> {
    return this.http.get(`/api/orders/find/${orderId}`, {responseType: 'text'})
      .pipe(
        map(res => {
          const order = {...JSON.parse(res) as Order}
          // console.log(order);
          // order.deliveryDate = new Date(order.deliveryDate);
          // order.orderDate = new Date(order.orderDate);
          // console.log(order);
          return order;
        })
      )
  }
}
