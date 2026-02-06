import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { OrderItem, AddOrderItemData } from "../../../shared/order-item";
import { OrderItemsService } from "./order.items.service";
import { NormService } from "src/norms/norm.service";

@Controller('order-items')
export class OrderItemsController {

    constructor(private orderDB: OrderItemsService, private normDB: NormService) { }

    @Post()
    async createOrderItem(@Body() orderItemData: AddOrderItemData): Promise<OrderItem> {
        const orderItem: Partial<OrderItem> = {};
        const norm = await this.normDB.findNorm(orderItemData.itemCode)
        orderItem.numberOfDeliveredTp = 0;
        orderItem.numberOfReadyTp = 0;
        orderItem.numberOfOrderedTp = orderItemData.orderedTp;
        if(norm) {
            orderItem.productId = norm._id;
        }

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