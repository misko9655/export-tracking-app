import * as mongoose from 'mongoose';

export const NormSchema = new mongoose.Schema({
    normCode: String,
    normUnitOfMeasure: String,
    elementType: String,
    elementWarehouseID: String,
    elementWarehouseName: String,
    elementItemCode: String,
    elementItemName: String,
    elementItemUnitOfMeasure: String,
    elementItemQuantity: Number
});