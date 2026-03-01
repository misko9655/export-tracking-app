import { Module } from "@nestjs/common";
import { NormsController } from "./norms.controller";
import { NormsService } from "./norms.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Norm, NormSchema } from "./norm.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Norm.name, schema: NormSchema}])
    ],
    controllers: [NormsController],
    providers: [NormsService]
})
export class NormsModule {}