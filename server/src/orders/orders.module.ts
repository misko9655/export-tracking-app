import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./schemas/order.schema";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { OrderItem, OrderItemSchema } from "src/order-items/order-item.schema";
import { Customer, CustomerSchema } from "src/customers/schemas/customer.schema";
import { EventsModule } from "src/events/events.module";
import { MailModule } from "src/mail/mail.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema},
            { name: OrderItem.name, schema: OrderItemSchema},
            { name: Customer.name, schema: CustomerSchema},
        ]),
        EventsModule,
        MailModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService]
})
export class OrdersModule {}