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

    @Get(':customerId')
    async getAllOrders(@Param('customerId') customerId: string): Promise<Order[] | null> {
        console.log('Fetching all orders for specific customer');
        return this.orderDB.getCustomerOrders(customerId);
    }

    @Get('find/:orderId')
    async getOrder(@Param('orderId') orderId: string): Promise<Order | null> {
        console.log(`Fetching order with id: ${orderId}`);
        return this.orderDB.getOrder(orderId);
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