import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Product {

    @Prop()
    productCode: string;

    @Prop()
    productName: string;

    @Prop()
    unitOfMeasure: string;

    @Prop()
    unitsInTransportBox: number;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);