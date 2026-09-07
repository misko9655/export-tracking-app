import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Repromaterijal, RepromaterijalSchema } from "./schemas/repromaterijal.schema";
import { RepromaterijaliController } from "./repromaterijali.controller";
import { RepromaterijaliService } from "./repromaterijali.service";
import { NormativTreeModule } from "src/normativ-tree/normativ-tree.module";
import { ArtikliLogistikaModule } from "src/artikli-logistika/artikli-logistika.module";
import { EventsModule } from "src/events/events.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Repromaterijal.name, schema: RepromaterijalSchema }]),
        NormativTreeModule,
        ArtikliLogistikaModule,
        EventsModule,
    ],
    controllers: [RepromaterijaliController],
    providers: [RepromaterijaliService],
    exports: [RepromaterijaliService],
})
export class RepromaterijaliModule {}
