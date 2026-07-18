import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { Customer, CustomerSchema } from "src/customers/schemas/customer.schema";
import { Order, OrderSchema } from "src/orders/schemas/order.schema";
import { OrderItem, OrderItemSchema } from "src/order-items/order-item.schema";
import { NormativTreeModule } from "src/normativ-tree/normativ-tree.module";
import { AuthModule } from "src/auth/auth.module";
import { NotificationEmailsModule } from "src/notification-emails/notification-emails.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Customer.name, schema: CustomerSchema },
            { name: Order.name, schema: OrderSchema },
            { name: OrderItem.name, schema: OrderItemSchema },
        ]),
        NormativTreeModule,
        AuthModule,
        NotificationEmailsModule,
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
