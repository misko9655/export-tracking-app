import { InjectModel } from "@nestjs/mongoose";
import { Customer } from "../../../shared/customer";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CustomersService {
    constructor(@InjectModel('Customer') private customerModel: Model<Customer>) {}

    deleteCustomer(customerId: string): Promise<Customer | null> {
       return this.customerModel.findByIdAndDelete(customerId).exec();
    }
    updateCustomer(customerId: string, changes: Partial<Customer>): Promise<Customer | null> {
        return this.customerModel.findOneAndUpdate(
            { _id: customerId},
            changes,
            {new: true}
        )
    }
    async getAllCustomers(): Promise<Customer[]> {
        return this.customerModel.find();
    }
    async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
        const newCustomer = new this.customerModel(customerData);
        await newCustomer.save();
        return newCustomer.toObject({versionKey: false});
    }

}