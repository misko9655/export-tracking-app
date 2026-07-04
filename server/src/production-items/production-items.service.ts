import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OrderItem, OrderItemDocument } from "src/order-items/order-item.schema";
import { Order, OrderDocument } from "src/orders/schemas/order.schema";
import { withOrderItemsPopulate } from "src/common/order-items-populate.util";

@Injectable()
export class ProductionItemsService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>
    ) {}

    async findAll() {
        const orders = await withOrderItemsPopulate(
            this.orderModel.find({ state: { $in: ['created', 'loading'] } })
        ).exec();

        return (orders as any[]).flatMap(order => order.items || []);
    }
}

