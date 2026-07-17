import { Module } from "@nestjs/common";
import { LagerService } from "./lager.service";
import { LagerController } from "./lager.controller";
import { NormativTreeModule } from "src/normativ-tree/normativ-tree.module";
import { ArtikliLogistikaModule } from "src/artikli-logistika/artikli-logistika.module";

@Module({
    imports: [NormativTreeModule, ArtikliLogistikaModule],
    providers: [LagerService],
    controllers: [LagerController],
})
export class LagerModule {}
 