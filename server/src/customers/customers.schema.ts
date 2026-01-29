import * as mongoose from "mongoose";

export const CustomerSchema = new mongoose.Schema({
    customerName: String,
    customerCountry: String
});