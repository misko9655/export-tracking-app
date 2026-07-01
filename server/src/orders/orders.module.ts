import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./schemas/order.schema";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { OrderItem, OrderItemSchema } from "src/order-items/order-item.schema";
import { EventsModule } from "src/events/events.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema},
            { name: OrderItem.name, schema: OrderItemSchema},
        ]),
        EventsModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService]
})
export class OrdersModule {}