import { Controller, Get, Param } from "@nestjs/common";
import { LagerService } from "./lager.service";

@Controller('lager')
export class LagerController {
    constructor(private readonly lagerService: LagerService) {}

    @Get(':skladisteId')
    async findBySkladiste(@Param('skladisteId') skladisteId: string) {
        return this.lagerService.findAll(skladisteId);
    }

    @Get()
    async findDefault() {
        return this.lagerService.findAll('003');
    }
}
