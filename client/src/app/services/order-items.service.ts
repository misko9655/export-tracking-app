import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { OrderItem } from "../models/order-item.model";
import { firstValueFrom } from "rxjs";



@Injectable({
  providedIn: 'root',
})
export class OrderItemsService {
    http = inject(HttpClient);

    async loadAllOrderItems(orderId: string): Promise<OrderItem[]> {
        const orderItems$ = this.http.get<OrderItem[]>(`/api/order-items/${orderId}`);
        return firstValueFrom(orderItems$);
    }

    async createOrderItem(orderItem: Partial<OrderItem>): Promise<OrderItem> {
        const orderItem$ = this.http.post<OrderItem>('/api/order-items', orderItem);
        return firstValueFrom(orderItem$);
    }

    async updateOrderItem(orderItemId: string, changes: Partial<OrderItem>): Promise<OrderItem> {
        const updatedOrderItem$ = this.http.patch<OrderItem>(`/api/order-items/${orderItemId}`, changes);
        return firstValueFrom(updatedOrderItem$);
    }

    async deleteOrderItem(orderItemId: string) {
        const deletedOrderItem$ = this.http.delete(`/api/order-items/${orderItemId}`);
        return firstValueFrom(deletedOrderItem$);
    }
}