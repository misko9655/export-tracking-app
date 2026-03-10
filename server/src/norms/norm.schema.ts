import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Norm {
    @Prop()
    normCode: string;

    @Prop()
    elementType: string;

    @Prop()
    elementWarehouseID: string;

    @Prop()
    elementWarehouseName: string;

    @Prop()
    elementItemCode: string;

    @Prop()
    elementItemName: string;

    @Prop()
    elementItemUnitOfMeasure: string;

    @Prop()
    elementItemQuantity: number;
}

export type NormDocument = HydratedDocument<Norm>;
export const NormSchema = SchemaFactory.createForClass(Norm);