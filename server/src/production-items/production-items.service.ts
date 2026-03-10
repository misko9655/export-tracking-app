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
            .select('-customerId -orderNo -orderName -__v -createdAt -updatedAt -isDelivered')
            .populate({
                path: 'items',
                populate: {
                    path: 'productId',
                    select: 'id elementItemName elementItemUnitOfMeasure elementItemQuantity'
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

        const allItems = (orders as any[]).flatMap(order => order.items || []);
        
        return allItems;
    }
}

