import * as mongoose from "mongoose";

export const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    orderNo: String,
    orderName: String,
    orderDate: Date,
    deliveryDate: Date
});