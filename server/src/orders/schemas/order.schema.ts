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

    @Prop({ required: false })
    orderNo: string;

    @Prop({ required: true })
    orderName: string;

    @Prop({ required: true, type: Date, default: Date.now })
    orderDate: Date;

    @Prop({ required: true, type: Date })   
    deliveryDate: Date;

    @Prop({ required: true, type: Object })
    deliveryDateFromProduction: {date: Date, comment: string};

    @Prop({ reqired: true, index: true })
    state: 'created' | 'loading' | 'delivered';

    @Prop({ required: false, default: false })
    domesticMarket: boolean;

    @Prop({required: false, type: Object})
    loadedOn: {date: Date, comment: string};

    @Prop({
        type: [{
            username:  { type: String, required: true },
            text:      { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }],
        default: []
    })
    comments: Array<{ username: string; text: string; createdAt: Date }>;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);

// Koristi ga countUndeliveredByCustomer/countActiveCustomers - filtrira po oba polja zajedno
OrderSchema.index({ customerId: 1, state: 1 });

OrderSchema.virtual('items', {
    ref: 'OrderItem',
    localField: '_id',
    foreignField: 'orderId',
    justOne: false,
    options: {sort: {productCode: 1}}
    
});


