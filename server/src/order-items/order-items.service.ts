import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OrderItem, OrderItemDocument } from "./order-item.schema";
import { Model, Types } from "mongoose";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";
import { Norm, NormDocument } from "src/norms/norm.schema";
import { Product, ProductDocument } from "src/products/product.schema";
import { ProductAndNorms, ProductAndNormsDocument } from "src/products/productWithNorms.schema";


@Injectable()
export class OrderItemsService {
    constructor(
        @InjectModel(OrderItem.name) private orderItemsModel: Model<OrderItemDocument>,
        @InjectModel(ProductAndNorms.name) private productAndNormsModel: Model<ProductAndNormsDocument>
    ) { }

    async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
        const productCode = createOrderItemDto.productCode;
        const product = await this.productAndNormsModel.findOne(
            { productCode }
        ).exec();
        if (!product) {
            throw new NotFoundException(`Product not found!`);
        }
        const tmpOrderItem = { ...createOrderItemDto };
        tmpOrderItem.productId = product._id;
        tmpOrderItem.orderId = new Types.ObjectId(createOrderItemDto.orderId);
        const createdOrderItem = new this.orderItemsModel(tmpOrderItem);
        return (await createdOrderItem.save()).populate('productId');
    }
    async createMultiple(createOrderItemDto: CreateOrderItemDto[]): Promise<OrderItem[]> {
        const productCodes = createOrderItemDto.map(d => d.productCode);
        const products = await this.productAndNormsModel.find({
            productCode: { $in: productCodes }
        }).exec();

        const productMap = new Map(products.map(p => [p.productCode, p]));

        const missingCode = productCodes.find(code => !productMap.has(code));
        if (missingCode) {
            throw new NotFoundException(`Product not found: ${missingCode}`);
        }

        const itemDocs = createOrderItemDto.map(orderItem => ({
            productCode: orderItem.productCode,
            numberOfOrderedTp: orderItem.numberOfOrderedTp,
            numberOfReadyTp: 0,
            productId: productMap.get(orderItem.productCode)!._id,
            orderId: new Types.ObjectId(orderItem.orderId),
        }));

        const inserted = await this.orderItemsModel.insertMany(itemDocs);

        return this.orderItemsModel
            .find({ _id: { $in: inserted.map(i => i._id) } })
            .populate('productId')
            .exec();
    }

    async findAll(orderId: string): Promise<OrderItem[]> {
        const objectId = new Types.ObjectId(orderId);
        return this.orderItemsModel.find({ orderId: objectId }).populate('productId').exec();
    }

    async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
        const orderItemForUpdate = { ...updateOrderItemDto };
        orderItemForUpdate.orderId = new Types.ObjectId(orderItemForUpdate.orderId);


        const updatedOrderItem = await this.orderItemsModel
            .findByIdAndUpdate(id, orderItemForUpdate, { returnDocument: 'after' })
            .populate('productId')
            .exec();

        if (!updatedOrderItem) {
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        return updatedOrderItem;
    }

    async delete(id: string): Promise<OrderItem> {
        const deletedOrderItem = await this.orderItemsModel.findByIdAndDelete(id).exec();

        if (!deletedOrderItem) {
            throw new NotFoundException(`Order item with id ${id} not found`);
        }
        return deletedOrderItem;
    }
}