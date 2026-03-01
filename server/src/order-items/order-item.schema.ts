import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Norm } from "src/norms/norm.schema";
import { Order } from "src/orders/schemas/order.schema";

@Schema({timestamps: true})
export class OrderItem {
    @Prop({ type: Types.ObjectId, ref: Order.name, required: true, index: true})
    orderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Norm.name, required: false, index: true})
    productId: Types.ObjectId;

    @Prop({required: true})
    productCode: string;

    @Prop({required: true})
    numberOfOrderedTp: number;

    @Prop({default: 0})
    numberOfReadyTp: number;

    @Prop({default: ''})
    lot: string;
    
    @Prop({type: Date})
    dateOfExpire: Date;
}

export type OrderItemDocument = HydratedDocument<OrderItem>;
export const OrderItemsSchema = SchemaFactory.createForClass(OrderItem);