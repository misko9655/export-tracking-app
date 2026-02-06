import * as mongoose from 'mongoose';

export const OrderItemSchema = new mongoose.Schema({
    orderId: String,
    productId: String,
    numberOfOrderedTp: Number,
    numberOfReadyTp: Number,
    numberOfDeliveredTp: Number
});