import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Order, OrderDocument } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderItem, OrderItemDocument } from "src/order-items/order-item.schema";
import { Customer, CustomerDocument } from "src/customers/schemas/customer.schema";
import { EventsGateway } from "src/events/events.gateway";
import { MailService } from "src/mail/mail.service";


@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        private eventsGateway: EventsGateway,
        private mailService: MailService,
    ) {}

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const tmpOrder = {...createOrderDto};
        tmpOrder.customerId = new Types.ObjectId(createOrderDto.customerId);
        const createdOrder = new this.orderModel(tmpOrder);
        const saved = await createdOrder.save();
        this.eventsGateway.broadcast('order', 'created');

        const customer = await this.customerModel.findById(saved.customerId).lean();
        this.mailService.sendOrderCreatedNotification({
            orderName: saved.orderName,
            customerName: customer?.name ?? '',
            deliveryDate: saved.deliveryDate,
        });

        return saved;
    }

    async findAllByCustomer(customerId: string): Promise<Order[]> {
        const objectId = new Types.ObjectId(customerId);
        return this.orderModel.find({customerId: objectId}).exec();
    }

    async findOne(id: string): Promise<Order> {

        const order = await this.orderModel.findById(id).populate('customerId').exec();
        if (!order) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }
        return order;
    }
    
    async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const dataToUpdate = {...updateOrderDto};
        dataToUpdate.customerId = new Types.ObjectId(dataToUpdate.customerId);
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(id, dataToUpdate, { returnDocument: 'after' })
            .exec();

        if (!updatedOrder) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }
        this.eventsGateway.broadcast('order', 'updated', { id });
        return updatedOrder;
    }

    async delete(id: string): Promise<Order> {
        const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();
        if (!deletedOrder) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }
        this.eventsGateway.broadcast('order', 'deleted', { id });
        return deletedOrder;
    }

    async markAsDelivered(id: string): Promise<Order> {
        const deliveredOrder = await this.orderModel
            .findByIdAndUpdate(id, { state: 'delivered' }, { new: true })
            .exec();

        if (!deliveredOrder) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }
        this.eventsGateway.broadcast('order', 'updated', { id });
        return deliveredOrder;
    }

    async countUndeliveredByCustomer(customerId: string): Promise<number> {
        return this.orderModel.countDocuments({ customerId, state: { $in: ['loading', 'created']}}).exec();
    }

    async addComment(orderId: string, username: string, text: string): Promise<Order> {
        const updated = await this.orderModel
            .findByIdAndUpdate(orderId,
                { $push: { comments: { username, text, createdAt: new Date() } } },
                { new: true }
            ).exec();
        if (!updated) throw new NotFoundException(`Order with id ${orderId} not found`);
        this.eventsGateway.broadcast('order', 'updated', { id: orderId });

        const customer = await this.customerModel.findById(updated.customerId).lean();
        this.mailService.sendCommentAddedNotification({
            orderName: updated.orderName,
            customerName: customer?.name ?? '',
            username,
            text,
        });

        return updated;
    }

    async deleteComment(orderId: string, commentId: string): Promise<Order> {
        const updated = await this.orderModel
            .findByIdAndUpdate(orderId,
                { $pull: { comments: { _id: new Types.ObjectId(commentId) } } },
                { new: true }
            ).exec();
        if (!updated) throw new NotFoundException(`Order with id ${orderId} not found`);
        this.eventsGateway.broadcast('order', 'updated', { id: orderId });
        return updated;
    }

    async deleteOrderWithItems(orderId: string): Promise<{ success: boolean; message: string }> {
            // Validate order exists
            const objectId = new Types.ObjectId(orderId);
            const order = await this.orderModel.findById(objectId);
            if (!order) {
                throw new BadRequestException('Order not found');
            }
            
            try {
                // Find all items for this order
                const items = await this.orderItemModel.find({ orderId: objectId });
                
                // Delete order items for this order
                if (items.length > 0) {
                    const itemsDeleted = await this.orderItemModel.deleteMany({ 
                        orderId: objectId
                    });
                    
                }
            
                
                // Delete the order
                const orderDeleted = await this.orderModel.deleteOne({ 
                    _id: objectId
                });
                
                if (orderDeleted.deletedCount === 0) {
                    throw new BadRequestException('Failed to delete order!');
                }

                this.eventsGateway.broadcast('order', 'deleted', { id: orderId });
                this.eventsGateway.broadcast('order-item', 'deleted', { orderId });

                return {
                    success: true,
                    message: `Order "${order.orderName}" and all associated items deleted successfully`
                };
                
            } catch (error: any) {
                throw new BadRequestException(`Delete failed: ${error.message}`);
            }
        }
}