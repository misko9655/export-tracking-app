import { Injectable } from "@nestjs/common";
import { Order } from "../../../shared/order";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class OrdersService {
    constructor(@InjectModel('Order') private orderModel: Model<Order>) {}
    
    deleteOrder(orderId: string) {
        throw new Error("Method not implemented.");
    }
    updateOrder(orderId: string, changes: Partial<Order>): Order | PromiseLike<Order | null> | null {
        throw new Error("Method not implemented.");
    }
    async getAllOrders(): Promise<Order[]> {
        return this.orderModel.find()
    }
    createOrder(order: Partial<Order>): import("../../../shared/order").Order | PromiseLike<import("../../../shared/order").Order> {
        throw new Error("Method not implemented.");
    }


}