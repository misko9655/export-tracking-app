import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Customer, CustomerDocument } from "src/customers/schemas/customer.schema";
import { Order, OrderDocument } from "src/orders/schemas/order.schema";
import { OrderItem, OrderItemDocument } from "src/order-items/order-item.schema";
import { NormativTreeService } from "src/normativ-tree/normativ-tree.service";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
        private normativTreeService: NormativTreeService,
        private authService: AuthService,
    ) {}

    async getStats() {
        const [customersCount, activeOrdersCount, deliveredOrdersCount, orderItemsCount] = await Promise.all([
            this.customerModel.countDocuments().exec(),
            this.orderModel.countDocuments({ state: { $in: ['created', 'loading'] } }).exec(),
            this.orderModel.countDocuments({ state: 'delivered' }).exec(),
            this.orderItemModel.countDocuments().exec(),
        ]);

        return {
            customersCount,
            activeOrdersCount,
            deliveredOrdersCount,
            orderItemsCount,
            erpAvailable: this.normativTreeService.isApiAvailable(),
            lastRefreshedAt: this.normativTreeService.getLastRefreshedAt(),
        };
    }

    async getUsers() {
        return this.authService.findAllUsers();
    }
}
