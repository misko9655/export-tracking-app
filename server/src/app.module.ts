import { Module } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';
import { NormsModule } from './norms/norms.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { ProductionItemsModule } from './production-items/production-items.module';
import { ProductsModule } from './products/products.module';
import { SupplyModule } from './supply/supply.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/export-tracking-app-db',
      }),
      inject: [ConfigService]
    }),
    CustomersModule,
    OrdersModule,
    NormsModule,
    OrderItemsModule,
    ProductionItemsModule,
    ProductsModule,
    SupplyModule
  ]
})
export class AppModule {}
