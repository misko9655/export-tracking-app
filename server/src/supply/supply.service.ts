import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, OrderDocument } from "src/orders/schemas/order.schema";


@Injectable()
export class SupplyService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }


    private withItemsPopulate(query: any) {
        return query
            .select('-customerId -orderNo -orderName -__v -createdAt -updatedAt -state')
            .populate({
                path: 'items',
                select: '-lot -createdAt -updatedAt -__v',
                populate: {
                    path: 'orderId',
                    select: 'id orderName deliveryDate',
                    populate: {
                        path: 'customerId',
                        select: 'id name'
                    }
                }
            });
    }

    async findForOrder(orderId: string) {
        const order: any = await this.withItemsPopulate(
            this.orderModel.findById(orderId)
        ).exec();

        return order.items;
    }

    async findForAll() {
        const orders: any[] = await this.withItemsPopulate(
            this.orderModel.find({ state: { $in: ['created', 'loading'] } })
        ).exec();

        return orders.flatMap(order => order.items);
    }


}   