import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { Order, OrderSchema } from 'src/orders/schemas/order.schema';
import { OrderItem, OrderItemSchema } from 'src/order-items/order-item.schema';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema},
      { name: Order.name, schema: OrderSchema},
      { name: OrderItem.name, schema: OrderItemSchema}

    ]),
    EventsModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService]
})  
export class CustomersModule {}
