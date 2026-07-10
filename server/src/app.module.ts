import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { ProductionItemsModule } from './production-items/production-items.module';
import { SupplyModule } from './supply/supply.module';
import { AuthModule } from './auth/auth.module';
import { LagerModule } from './lager/lager.module';
import { NormativTreeModule } from './normativ-tree/normativ-tree.module';
import { ArtikliLogistikaModule } from './artikli-logistika/artikli-logistika.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GetUserMiddleware } from './middleware/get-user.middleware';
import { ServeStaticModule } from 'node_modules/@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication.guard';
import { User, UserSchema } from './auth/users.schema';
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
        retryAttempts: 30,
        retryDelay: 5000,
      }),
      inject: [ConfigService]
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public/client/browser'),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
    CustomersModule,
    OrdersModule,
    OrderItemsModule,
    ProductionItemsModule,
    SupplyModule,
    LagerModule,
    NormativTreeModule,
    ArtikliLogistikaModule,
    DashboardModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    GetUserMiddleware,
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetUserMiddleware)
      .forRoutes('*');
  }
}
