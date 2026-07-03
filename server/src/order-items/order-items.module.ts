import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderItem, OrderItemSchema } from "./order-item.schema";
import { OrderItemsController } from "./order-items.controller";
import { OrderItemsService } from "./order-items.service";
import { NormativTreeModule } from "src/normativ-tree/normativ-tree.module";
import { EventsModule } from "src/events/events.module";
import { ArtikliLogistikaModule } from "src/artikli-logistika/artikli-logistika.module";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: OrderItem.name, schema: OrderItemSchema }]),
        NormativTreeModule,
        EventsModule,
        ArtikliLogistikaModule,
    ],
    controllers: [OrderItemsController],
    providers: [OrderItemsService]
})
export class OrderItemsModule {}
