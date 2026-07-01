import { Module } from "@nestjs/common";
import { LagerService } from "./lager.service";
import { LagerController } from "./lager.controller";

@Module({
    providers: [LagerService],
    controllers: [LagerController],
})
export class LagerModule {}
 