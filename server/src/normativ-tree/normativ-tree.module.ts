import { Module } from "@nestjs/common";
import { NormativTreeController } from "./normativ-tree.controller";
import { NormativTreeService } from "./normativ-tree.service";

@Module({
    controllers: [NormativTreeController],
    providers: [NormativTreeService],
})
export class NormativTreeModule {}
