import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { Order } from "../../../shared/order";

@Controller('orders')
export class OrdersController {
    constructor(private orderDB: OrdersService) {}

    @Post()
    async createOrder(@Body() order: Partial<Order>): Promise<Order> {
        return this.orderDB.createOrder(order);
    }

    @Get()
    async getAllOrders(): Promise<Order[]> {
        console.log('Fetching all orders from DB');
        return this.orderDB.getAllOrders();
    }

    @Put(':orderId')
    async updateOrder(
        @Param('orderId') orderId: string,
        @Body() changes: Partial<Order>
    ): Promise<Order | null> {
        return this.orderDB.updateOrder(orderId, changes);
    }

    @Delete(':orderId')
    async deleteOrder(@Param('orderId') orderId:string) {
        this.orderDB.deleteOrder(orderId);
    }
}