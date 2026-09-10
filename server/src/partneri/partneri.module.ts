import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Partner, PartnerSchema } from "./schemas/partner.schema";
import { PartneriController } from "./partneri.controller";
import { PartneriService } from "./partneri.service";
import { EventsModule } from "src/events/events.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Partner.name, schema: PartnerSchema }]),
        EventsModule,
    ],
    controllers: [PartneriController],
    providers: [PartneriService],
})
export class PartneriModule {}
