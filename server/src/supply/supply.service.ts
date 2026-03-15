import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, OrderDocument } from "src/orders/schemas/order.schema";


@Injectable()
export class SupplyService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) {}

    async findForOrder(orderId: string) {
        const order = await this.orderModel.findById(orderId)
        .select('-customerId -orderNo -orderName -__v -createdAt -updatedAt -isDelivered')
            .populate({
                path: 'items',
                populate: {
                    path: 'productId',
                    select: '-createdAt -updatedAt -__v',
                    populate: {
                        path: 'norms',
                        select: '-createdAt -updatedAt -__v'
                    }
                }
            })
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
            })
            .exec();

        return (order as any).items
    }
}   