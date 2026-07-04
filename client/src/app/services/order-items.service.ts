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

    async createMultipleOrderItems(orderItems: Partial<OrderItem>[]): Promise<OrderItem> {
        const orderItems$ = this.http.post<OrderItem>('/api/order-items/multiple', orderItems);
        return firstValueFrom(orderItems$);

    }

    async updateOrderItem(orderItemId: string, changes: Partial<OrderItem>): Promise<OrderItem> {
        const updatedOrderItem$ = this.http.patch<OrderItem>(`/api/order-items/${orderItemId}`, changes);
        return firstValueFrom(updatedOrderItem$);
    }

    async deleteOrderItem(orderItemId: string) {
        const deletedOrderItem$ = this.http.delete(`/api/order-items/${orderItemId}`);
        return firstValueFrom(deletedOrderItem$);
    }

    async updateLogistics(): Promise<{ updated: number; total: number }> {
        const result$ = this.http.post<{ updated: number; total: number }>('/api/order-items/update-logistics', {});
        return firstValueFrom(result$);
    }
}