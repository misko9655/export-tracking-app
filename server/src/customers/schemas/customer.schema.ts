import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({timestamps: true})
export class Customer {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    country: string;

    @Prop()
    deliveryAddress?: string;

    @Prop({ default: true })
    isActive: boolean;
}

export type CustomerDocument = HydratedDocument<Customer>;

export const CustomerSchema = SchemaFactory.createForClass(Customer);