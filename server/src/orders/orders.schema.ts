import * as mongoose from "mongoose";

export const OrderSchema = new mongoose.Schema({
    customerId: String,
    orderNo: String,
    orderName: String,
    orderDate: Date,
    deliveryDate: Date
});