import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, OrderDocument } from "src/orders/schemas/order.schema";
import { withOrderItemsPopulate } from "src/common/order-items-populate.util";


@Injectable()
export class SupplyService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }

    async findForOrder(orderId: string) {
        const order: any = await withOrderItemsPopulate(
            this.orderModel.findById(orderId)
        ).exec();

        return order.items;
    }

    async findForAll() {
        const orders: any[] = await withOrderItemsPopulate(
            this.orderModel.find({ state: { $in: ['created', 'loading'] } })
        ).exec();

        return orders.flatMap(order => order.items);
    }


}