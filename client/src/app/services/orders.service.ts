import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  http = inject(HttpClient);

  // Keširano po customerId/orderId dok se nešto stvarno ne promeni - mutacije
  // ispod i komponente (na realtime 'order'/'order-item' event) invalidiraju.
  private ordersByCustomerCache = new Map<string, Promise<Order[]>>();
  private orderCache = new Map<string, Promise<Order>>();

  async loadAllOrders(customerId: string): Promise<Order[]> {
    if (!this.ordersByCustomerCache.has(customerId)) {
      const promise = firstValueFrom(this.http.get<Order[]>(`/api/orders/${customerId}`))
        .catch(err => { this.ordersByCustomerCache.delete(customerId); throw err; });
      this.ordersByCustomerCache.set(customerId, promise);
    }
    return this.ordersByCustomerCache.get(customerId)!;
  }

  async loadOrder(orderId: string): Promise<Order> {
    if (!this.orderCache.has(orderId)) {
      const promise = firstValueFrom(this.http.get<Order>(`/api/orders/find-one/${orderId}`))
        .catch(err => { this.orderCache.delete(orderId); throw err; });
      this.orderCache.set(orderId, promise);
    }
    return this.orderCache.get(orderId)!;
  }

  invalidate() {
    this.ordersByCustomerCache.clear();
    this.orderCache.clear();
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    const order$ = this.http.post<Order>('/api/orders', order);
    const created = await firstValueFrom(order$);
    this.invalidate();
    return created;
  }

  async updateOrder(orderId: string, changes: Partial<Order>): Promise<Order> {
    const order$ = this.http.patch<Order>(`/api/orders/${orderId}`, changes);
    const updated = await firstValueFrom(order$);
    this.invalidate();
    return updated;
  }

  async deleteOrder(orderId: string) {
    const deletedOrder$ = this.http.delete(`/api/orders/${orderId}`);
    const result = await firstValueFrom(deletedOrder$);
    this.invalidate();
    return result;
  }

  async addComment(orderId: string, text: string, username: string): Promise<Order> {
    const updated = await firstValueFrom(
      this.http.post<Order>(`/api/orders/${orderId}/comments`, { username, text })
    );
    this.invalidate();
    return updated;
  }

  async deleteComment(orderId: string, commentId: string): Promise<Order> {
    const updated = await firstValueFrom(
      this.http.delete<Order>(`/api/orders/${orderId}/comments/${commentId}`)
    );
    this.invalidate();
    return updated;
  }
}

