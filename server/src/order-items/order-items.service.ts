import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OrderItem, OrderItemDocument } from "./order-item.schema";
import { Model, Types } from "mongoose";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";
import { Norm, NormDocument } from "src/norms/norm.schema";
import { Product, ProductDocument } from "src/products/product.schema";


@Injectable()
export class OrderItemsService {
    constructor(
        @InjectModel(OrderItem.name) private orderItemsModel: Model<OrderItemDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>
    ) {}

    async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
        const productCode = createOrderItemDto.productCode;
        const product = await this.productModel.findOne(
            {productCode}
        ).exec();
        if(!product) {
            throw new NotFoundException(`Product not found!`);
        }
        const tmpOrderItem = {...createOrderItemDto};
        tmpOrderItem.productId = product._id;
        tmpOrderItem.orderId = new Types.ObjectId(createOrderItemDto.orderId);
        const createdOrderItem = new this.orderItemsModel(tmpOrderItem);
        return (await createdOrderItem.save()).populate('productId');
    }

    async findAll(orderId: string): Promise<OrderItem[]> {
        const objectId = new Types.ObjectId(orderId);
        return this.orderItemsModel.find({orderId: objectId}).populate('productId').exec();
    }

    async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
        updateOrderItemDto.orderId = new Types.ObjectId(updateOrderItemDto.orderId);
        updateOrderItemDto.productId = new Types.ObjectId(updateOrderItemDto.productId);
        console.log()
        const updatedOrderItem = await this.orderItemsModel
            .findByIdAndUpdate(id, updateOrderItemDto, {new: true})
            .exec();

        if(!updatedOrderItem) {
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        return this.orderItemsModel
        .findById(updatedOrderItem._id)
        .populate('productId')
        .exec();
    }

    async delete(id: string): Promise<OrderItem> {
        const deletedOrderItem = await this.orderItemsModel.findByIdAndDelete(id).exec();

        if(!deletedOrderItem) {
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        return deletedOrderItem;
    }
}