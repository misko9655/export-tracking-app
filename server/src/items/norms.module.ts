import { Module } from "@nestjs/common";
import { NormsController } from "./controllers/norms.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { NormSchema } from "./schemas/norm.schema";
import { NormService } from "./services/norm.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: "Norm", schema: NormSchema
            }
        ])
    ],
    controllers: [NormsController],
    providers: [NormService]
})
export class NormsModule {}