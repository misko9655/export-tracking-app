import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderItem, OrderItemSchema } from "./order-item.schema";
import { OrderItemsController } from "./order-items.controller";
import { OrderItemsService } from "./order-items.service";
import { Norm, NormSchema } from "src/norms/norm.schema";


@Module({
    imports: [
        MongooseModule.forFeature([{name: OrderItem.name, schema: OrderItemSchema}]),
        MongooseModule.forFeature([{name: Norm.name, schema: NormSchema}])
    ],
    controllers: [OrderItemsController],
    providers: [OrderItemsService]
})
export class OrderItemsModule {}