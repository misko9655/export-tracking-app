import { Module } from "@nestjs/common";
import { NormsController } from "./controllers/norms.controller";
import { ItemsService } from "./services/items.service";
import { MongooseModule } from "@nestjs/mongoose";
import { NormSchema } from "./schemas/norm.schema";
import { NormService } from "./services/norm.service";
import { Model } from "mongoose";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: "Norm", schema: NormSchema
            }
        ])
    ],
    controllers: [NormsController],
    providers: [ItemsService, NormService]
})
export class NormsModule {}