import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NormativTreeController } from "./normativ-tree.controller";
import { NormativTreeService } from "./normativ-tree.service";
import { OrderItem, OrderItemSchema } from "src/order-items/order-item.schema";
import { Order, OrderSchema } from "src/orders/schemas/order.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: OrderItem.name, schema: OrderItemSchema },
            { name: Order.name, schema: OrderSchema },
        ]),
    ],
    controllers: [NormativTreeController],
    providers: [NormativTreeService],
    exports: [NormativTreeService],
})
export class NormativTreeModule {}
