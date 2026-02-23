import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  http = inject(HttpClient);

  async loadAllOrders(customerId: string): Promise<Order[]> {
      const orders$ = this.http.get<Order[]>(`/api/orders/${customerId}`);
      return firstValueFrom(orders$);
  }

  async loadOrder(orderId: string): Promise<Order> {
    const order$ = this.http.get<Order>(`/api/orders/find-one/${orderId}`);
    return firstValueFrom(order$);
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    const order$ = this.http.post<Order>('/api/orders', order);
    return firstValueFrom(order$);
  }

  async updateOrder(orderId: string, changes: Partial<Order>): Promise<Order> {
    const order$ = this.http.patch<Order>(`/api/orders/${orderId}`, changes);
    return firstValueFrom(order$);
  }

  async deleteOrder(orderId: string) {
    const deletedOrder$ = this.http.delete(`/api/orders/${orderId}`);
    return firstValueFrom(deletedOrder$);
  }
}

