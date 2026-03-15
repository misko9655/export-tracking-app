import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class OrderItem {
    @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true})
    orderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: false, index: true})
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
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
