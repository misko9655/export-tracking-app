import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderItemSchema } from "./order.items.schema";
import { OrderItemsController } from "./order.items.controller";
import { OrderItemsService } from "./order.items.service";


@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'OrderItem', schema: OrderItemSchema
            }
        ])
    ],
    controllers: [OrderItemsController],
    providers: [OrderItemsService]
})
export class OrderItemsModule {
    
}