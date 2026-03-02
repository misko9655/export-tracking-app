import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OrderItem, OrderItemDocument } from "./order-item.schema";
import { Model, Types } from "mongoose";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";
import { Norm, NormDocument } from "src/norms/norm.schema";


@Injectable()
export class OrderItemsService {
    constructor(
        @InjectModel(OrderItem.name) private orderItemsModel: Model<OrderItemDocument>,
        @InjectModel(Norm.name) private normModel: Model<NormDocument>
    ) {}

    async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
        const normCode = createOrderItemDto.productCode;
        console.log(normCode);
        const norm = await this.normModel.findOne(
            {elementItemCode: normCode, elementWarehouseID: '903', elementType: 'Gotov proizvod'}
        ).exec();
        console.log(norm);
        if(!norm) {
            throw new NotFoundException(`Product not found!`);
        }
        const tmpOrderItem = {...createOrderItemDto};
        tmpOrderItem.productId = norm._id;
        tmpOrderItem.orderId = new Types.ObjectId(createOrderItemDto.orderId);
        const createdOrderItem = new this.orderItemsModel(tmpOrderItem);
        return (await createdOrderItem.save()).populate('productId');
    }

    async findAll(orderId: string): Promise<OrderItem[]> {
        
        return this.orderItemsModel.find({orderId}).populate('productId').exec();
    }

    async update(id: string, updateOrderItemDto: UpdateOrderItemDto): Promise<OrderItem> {
        const updatedOrderItem = await this.orderItemsModel
            .findByIdAndUpdate(id, updateOrderItemDto, {new: true})
            .exec();

        if(!updatedOrderItem) {
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        return updatedOrderItem;
    }

    async delete(id: string): Promise<OrderItem> {
        const deletedOrderItem = await this.orderItemsModel.findByIdAndDelete(id).exec();

        if(!deletedOrderItem) {
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        return deletedOrderItem;
    }
}