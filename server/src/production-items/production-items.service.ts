import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OrderItem, OrderItemDocument } from "src/order-items/order-item.schema";
import { Order, OrderDocument } from "src/orders/schemas/order.schema";

@Injectable()
export class ProductionItemsService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>
    ) {}

    async findAll() {
        const orders = await this.orderModel.find({isDelivered: false})
            .populate({path: 'customerId', select: '_id name'})
            .populate('items')
            .exec();


        return orders;
    }
}