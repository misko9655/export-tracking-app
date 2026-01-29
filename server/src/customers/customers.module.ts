import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CustomerSchema } from "./customers.schema";
import { CustomersController } from "./customers.controller";
import { CustomersService } from "./customers.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: "Customer", schema: CustomerSchema
            }
        ])
    ],
    controllers: [CustomersController],
    providers: [CustomersService]
})
export class CustomersModule {}