import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "src/orders/schemas/order.schema";
import { ProductionItemsController } from "./production-items.controller";
import { ProductionItemsService } from "./production-items.service";
import { OrderItem, OrderItemSchema } from "src/order-items/order-item.schema";


@Module({
    imports: [
        MongooseModule.forFeature([{name: Order.name, schema: OrderSchema}]),
        MongooseModule.forFeature([{name: OrderItem.name, schema: OrderItemSchema}])
    ],
    controllers: [ProductionItemsController],
    providers: [ProductionItemsService]
})
export class ProductionItemsModule {}