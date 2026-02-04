import { Injectable } from "@nestjs/common";
import { Order } from "../../../shared/order";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel('Order') private orderModel: Model<Order>
    ) {}
    
    async createOrder(orderData: Partial<Order>): Promise<Order> {
        const newOrder = new this.orderModel(orderData);
        await newOrder.save();
        return newOrder.toObject({ versionKey: false });
    }

    async getCustomerOrders(customerID: string): Promise<Order[] | null> {
        return this.orderModel.find({customerID: customerID})
    }

    async getOrder(orderId: string): Promise<Order | null> {
        console.log(orderId);
        return this.orderModel.findById(orderId);
    }

    updateOrder(orderId: string, changes: Partial<Order>): Promise<Order | null> {
        return this.orderModel.findOneAndUpdate(
            {_id: orderId},
            changes,
            {new: true}
        );
    }
    
    deleteOrder(orderId: string): Promise<Order | null> {
        return this.orderModel.findByIdAndDelete(orderId).exec();
    }
}