import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Order, OrderDocument } from 'src/orders/schemas/order.schema';
import { OrderItem, OrderItemDocument } from 'src/order-items/order-item.schema';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class CustomersService {

    constructor(
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
        private eventsGateway: EventsGateway,
    ) {}

    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        const createdCustomer = new this.customerModel(createCustomerDto);
        const saved = await createdCustomer.save();
        this.eventsGateway.broadcast('customer', 'created');
        return saved;
    }

    async findAll(): Promise<Customer[]> {
        return this.customerModel.find().sort({name: 1}).exec();
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
        this.eventsGateway.broadcast('customer', 'updated', { id });
        return updatedCustomer;
    }

    async remove(id: string): Promise<Customer> {
        const deletedCustomer = await this.customerModel.findByIdAndDelete(id).exec();
        if (!deletedCustomer) {
            throw new NotFoundException(`Customer with id ${id} not found`);
        }
        this.eventsGateway.broadcast('customer', 'deleted', { id });
        return deletedCustomer;
    }

    async deactivate(id: string): Promise<Customer> {
        const deactivatedCustomer = await this.customerModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();

        if (!deactivatedCustomer) {
            throw new NotFoundException(`Customer with id ${id} not found`);
        }
        this.eventsGateway.broadcast('customer', 'updated', { id });
        return deactivatedCustomer;
    }

    async countActiveCustomers(): Promise<number> {
        return this.customerModel.countDocuments({ isActive: true }).exec();
    }

    async deleteCustomerWithOrders(customerId: string): Promise<{ success: boolean; message: string }> {
        // Validate customer exists
        const objectId = new Types.ObjectId(customerId);
        const customer = await this.customerModel.findById(customerId);
        if (!customer) {
            throw new BadRequestException('Customer not found');
        }
        
        try {
            // Find all orders for this customer
            const orders = await this.orderModel.find({ customerId: objectId });
            const orderIds = orders.map(order => order._id);
            
            // Delete order items for these orders
            if (orderIds.length > 0) {
                const itemsDeleted = await this.orderItemModel.deleteMany({ 
                    orderId: { $in: orderIds } 
                });
                
            }
            
            // Delete orders
            if (orderIds.length > 0) {
                const ordersDeleted = await this.orderModel.deleteMany({ 
                    customerId: objectId 
                });
                
            }
            
            // Delete the customer
            const customerDeleted = await this.customerModel.deleteOne({ 
                _id: customerId 
            });
            
            if (customerDeleted.deletedCount === 0) {
                throw new BadRequestException('Failed to delete customer');
            }

            this.eventsGateway.broadcast('customer', 'deleted', { id: customerId });
            this.eventsGateway.broadcast('order', 'deleted', { customerId });

            return {
                success: true,
                message: `Customer "${customer.name}" and all associated orders/items deleted successfully`
            };
            
        } catch (error: any) {
            throw new BadRequestException(`Delete failed: ${error.message}`);
        }
    }

}
