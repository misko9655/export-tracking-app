import { Module } from "@nestjs/common";
import { LagerService } from "./lager.service";
import { LagerController } from "./lager.controller";
import { NormativTreeModule } from "src/normativ-tree/normativ-tree.module";
import { ArtikliLogistikaModule } from "src/artikli-logistika/artikli-logistika.module";
import { RepromaterijaliModule } from "src/repromaterijali/repromaterijali.module";

@Module({
    imports: [NormativTreeModule, ArtikliLogistikaModule, RepromaterijaliModule],
    providers: [LagerService],
    controllers: [LagerController],
    exports: [LagerService],
})
export class LagerModule {}
 