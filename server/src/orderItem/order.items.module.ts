import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderItemSchema } from "./order.items.schema";
import { OrderItemsController } from "./order.items.controller";
import { OrderItemsService } from "./order.items.service";
import { NormService } from "src/norms/norm.service";
import { NormsModule } from "src/norms/norms.module";


@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'OrderItem', schema: OrderItemSchema
            }
        ]),
        NormsModule
    ],
    controllers: [OrderItemsController],
    providers: [OrderItemsService]
})
export class OrderItemsModule {
    
}