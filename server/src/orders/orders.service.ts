import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, OrderDocument } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";


@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>
    ) {}

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const createdOrder = new this.orderModel(createOrderDto);
        return createdOrder.save();
    }

    async findAllByCustomer(customerId: string): Promise<Order[]> {
        return this.orderModel.find({ customerId }).exec();
    }

    async findOne(id: string): Promise<Order> {

        const order = await this.orderModel.findById(id).exec();
        if (!order) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }
        return order;
    }
    
    async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(id, updateOrderDto, { new: true })
            .exec();

        if (!updatedOrder) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }
        return updatedOrder;
    }

    async delete(id: string): Promise<Order> {
        const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();
        if (!deletedOrder) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }
        return deletedOrder;
    }

    async markAsDelivered(id: string): Promise<Order> {
        const deliveredOrder = await this.orderModel
            .findByIdAndUpdate(id, { isDelivered: true }, { new: true })
            .exec();

        if (!deliveredOrder) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }
        return deliveredOrder;
    }

    async countUndeliveredByCustomer(customerId: string): Promise<number> {
        return this.orderModel.countDocuments({ customerId, isDelivered: false }).exec();
    }
}