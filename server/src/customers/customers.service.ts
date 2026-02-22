import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {

    constructor(
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>
    ) {}

    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        const createdCustomer = new this.customerModel(createCustomerDto);
        return createdCustomer.save();
    }

    async findAll(): Promise<Customer[]> {
        return this.customerModel.find().exec();
    }

    async findOne(id: string): Promise<Customer> {
        const customer = await this.customerModel.findById(id).exec()
        if (!customer) {
            throw new NotFoundException(`Customer with id ${id} not found`);
        }
        return customer;
    }

    async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
        const updatedCustomer = await this.customerModel
            .findByIdAndUpdate(id, updateCustomerDto, { new: true })
            .exec();

        if (!updatedCustomer) {
            throw new NotFoundException(`Customer with id ${id} not found`);
        }
        return updatedCustomer;
    }

    async remove(id: string): Promise<Customer> {
        const deletedCustomer = await this.customerModel.findByIdAndDelete(id).exec();
        if (!deletedCustomer) {
            throw new NotFoundException(`Customer with id ${id} not found`);
        }
        return deletedCustomer;
    }

    async deactivate(id: string): Promise<Customer> {
        const deactivatedCustomer = await this.customerModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();

        if (!deactivatedCustomer) {
            throw new NotFoundException(`Customer with id ${id} not found`);
        }
        return deactivatedCustomer;
    }

    async countActiveCustomers(): Promise<number> {
        return this.customerModel.countDocuments({ isActive: true }).exec();
    }
}
