import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { OrderItem } from "../../../shared/order-item";
import { OrderItemsService } from "./order.items.service";

@Controller('order-items')
export class OrderItemsController {

    constructor(private orderDB: OrderItemsService) { }

    @Post()
    async createOrderItem(@Body() orderItem: Partial<OrderItem>): Promise<OrderItem> {
        return this.orderDB.createOrderItem(orderItem);
    }

    @Get()
    async getAllOrders(): Promise<OrderItem[]> {
        console.log('Fetching all order Items from DB');
        return this.orderDB.getAllOrderItems();
    }

    @Put(':orderItemId')
    async updateOrder(
        @Param('orderItemId') orderItemId: string,
        @Body() changes: Partial<OrderItem>
    ): Promise<OrderItem | null> {
        return this.orderDB.updateOrderItem(orderItemId, changes);
    }

    @Delete(':orderItemId')
    async deleteOrder(@Param('orderItemId') orderItemId: string) {
        this.orderDB.deleteOrderItem(orderItemId);
    }

}