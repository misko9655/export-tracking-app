import { Controller, Get, Param, Res } from "@nestjs/common";
import type { Response } from "express";
import { LagerService } from "./lager.service";

@Controller('lager')
export class LagerController {
    constructor(private readonly lagerService: LagerService) {}

    @Get(':skladisteId')
    async findBySkladiste(@Param('skladisteId') skladisteId: string, @Res({ passthrough: true }) res: Response) {
        const { items, usedFallback } = await this.lagerService.findAll(skladisteId);
        if (usedFallback) res.setHeader('X-Data-Source', 'fallback');
        return items;
    }

    @Get()
    async findDefault(@Res({ passthrough: true }) res: Response) {
        const { items, usedFallback } = await this.lagerService.findAll('003');
        if (usedFallback) res.setHeader('X-Data-Source', 'fallback');
        return items;
    }
}
