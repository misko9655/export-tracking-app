import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Customer } from "src/customers/schemas/customer.schema";


@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
})
export class Order {
    @Prop({ type: Types.ObjectId, ref: Customer.name, required: true, index: true })
    customerId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    orderNo: string;

    @Prop({ required: true })
    orderName: string;

    @Prop({ required: true, type: Date, default: Date.now })
    orderDate: Date;

    @Prop({ required: true, type: Date })   
    deliveryDate: Date;

    @Prop({ default: false })
    isDelivered: boolean;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.virtual('items', {
    ref: 'OrderItem',
    localField: '_id',
    foreignField: 'orderId',
    justOne: false,
    options: {sort: {productCode: 1}}
    
});
