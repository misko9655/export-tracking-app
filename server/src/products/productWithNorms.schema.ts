import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import {Types} from 'mongoose'


@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class ProductAndNorms {

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

    @Prop()
    onPallets: number;

    @Prop()
    norms: any[];


}

export type ProductAndNormsDocument = HydratedDocument<ProductAndNorms>;
export const ProductAndNormsSchema = SchemaFactory.createForClass(ProductAndNorms);
    
