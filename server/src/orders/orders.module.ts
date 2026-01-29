import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderSchema } from "./orders.schema";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Order', schema: OrderSchema
            }
        ])
    ],
    controllers: [OrdersController],
    providers: [OrdersService]
})
export class OrdersModule {

}