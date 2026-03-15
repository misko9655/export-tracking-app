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

    @Prop()
    normCode: string;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('norms', {
    ref: 'Norm',
    localField: 'normCode',
    foreignField: 'normCode',
    justOne: false,
    // options: {sort: {productCode: 1}}
    
});