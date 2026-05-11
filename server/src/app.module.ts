import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';
import { NormsModule } from './norms/norms.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { ProductionItemsModule } from './production-items/production-items.module';
import { ProductsModule } from './products/products.module';
import { SupplyModule } from './supply/supply.module';
import { ReproItemsModule } from './raw-materials/repro-items.module';
import { AuthModule } from './auth/auth.module';
import { GetUserMiddleware } from './middleware/get-user.middleware';
import { CustomersController } from './customers/customers.controller';
import { ServeStaticModule } from 'node_modules/@nestjs/serve-static';
import { join } from 'path';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public/client/browser'),
    }),
    AuthModule,
    CustomersModule,
    OrdersModule,
    NormsModule,
    OrderItemsModule,
    ProductionItemsModule,
    ProductsModule,
    SupplyModule,
    ReproItemsModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetUserMiddleware)
      .forRoutes(
        CustomersController
      );
  }
}
