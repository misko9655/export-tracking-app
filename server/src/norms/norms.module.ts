import { Module } from "@nestjs/common";
import { NormsController } from "./norms.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { NormSchema } from "./norm.schema";
import { NormService } from "./norm.service";

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