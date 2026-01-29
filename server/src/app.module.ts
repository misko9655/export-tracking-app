import { Module } from '@nestjs/common';
import { NormsModule } from './norms/norms.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_CONNECTION } from './costants';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    NormsModule,
    CustomersModule,
    OrdersModule,
    MongooseModule.forRoot(MONGO_CONNECTION)
  ]
})
export class AppModule {}
