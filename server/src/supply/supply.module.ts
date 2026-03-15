import { Module } from "@nestjs/common";
import { SupplyService } from "./supply.service";
import { SupplyController } from "./supply.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "src/orders/schemas/order.schema";


@Module({
    imports: [
        MongooseModule.forFeature([{name: Order.name, schema: OrderSchema}]),
    ],
    providers: [SupplyService],
    controllers: [SupplyController]
})
export class SupplyModule {}