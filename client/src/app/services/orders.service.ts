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
}
