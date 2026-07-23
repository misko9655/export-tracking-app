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

    @Prop({ required: true })
    productCode: string;

    @Prop({ default: '' })
    productName: string;

    @Prop({ default: '' })
    jm: string;

    @Prop({ default: '', index: true })
    normativId: string;

    @Prop({ required: true })
    numberOfOrderedTp: number;

    @Prop({default: 0})
    numberOfReadyTp: number;

    @Prop({default: ''})
    lot: string;
    
    @Prop({type: Date})
    dateOfExpire: Date;

    @Prop({ default: 0 })
    unitsInTransportBox: number;

    @Prop({ default: 0 })
    numberOfTpOnPallet: number;

    @Prop({ default: true })
    hasNormativ: boolean;

    @Prop({ default: true })
    hasLogisticsInfo: boolean;
}

export type OrderItemDocument = HydratedDocument<OrderItem>;
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
