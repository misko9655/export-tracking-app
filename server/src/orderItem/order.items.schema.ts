import * as mongoose from 'mongoose';

export const OrderItemSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Norm' },
    numberOfOrderedTP: Number,
    numberOfReadyTP: Number,
    numberOfDeliveredTP: Number
});