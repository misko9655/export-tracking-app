import * as mongoose from 'mongoose';

export const OrderItemSchema = new mongoose.Schema({
    orderId: String,
    productId: String,
    numberOfOrderedTP: Number,
    numberOfReadyTP: Number,
    numberOfDeliveredTP: Number
});