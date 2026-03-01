import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


@Schema({timestamps: true})
export class Norm {
    normCode: string;
    normUnitOfMeasure: string;
    elementType: string;
    elementWarehouseID: string;
    elementWarehouseName: string;
    elementItemCode: string;
    elementItemName: string;
    elementItemUnitOfMeasure: string;
    elementItemQuantity: number;
}

export type NormDocument = HydratedDocument<Norm>;
export const NormSchema = SchemaFactory.createForClass(Norm);