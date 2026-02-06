import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OrderItem } from "../../../shared/order-item";
import { Model } from "mongoose";

@Injectable()
export class OrderItemsService {
    constructor(@InjectModel('OrderItem') private orderItemModel: Model<OrderItem>) {}

    async createOrderItem(orderItemData: Partial<OrderItem>): Promise<OrderItem> {
        const newOrderItem = new this.orderItemModel(orderItemData);
        await newOrderItem.save();
        return newOrderItem.toObject({ versionKey: false });
    }

     async getAllOrderItems(): Promise<OrderItem[]> {
        return this.orderItemModel.find()
    }

    updateOrderItem(orderId: string, changes: Partial<OrderItem>): Promise<OrderItem | null> {
        return this.orderItemModel.findOneAndUpdate(
            {_id: orderId},
            changes,
            {new: true}
        );
    }

   deleteOrderItem(orderId: string): Promise<OrderItem | null> {
        return this.orderItemModel.findByIdAndDelete(orderId).exec();
    }

}