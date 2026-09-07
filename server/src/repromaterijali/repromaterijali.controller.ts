import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { RepromaterijaliService } from "./repromaterijali.service";
import { UpdateRepromaterijalDto } from "./dto/update-repromaterijal.dto";
import { SuperAdminGuard } from "src/guards/super-admin.guard";

@Controller('repromaterijali')
@UseGuards(SuperAdminGuard)
export class RepromaterijaliController {
    constructor(private readonly service: RepromaterijaliService) {}

    @Get()
    async findAll() {
        return this.service.findAll();
    }

    @Patch(':sifraRepromaterijala')
    async update(
        @Param('sifraRepromaterijala') sifraRepromaterijala: string,
        @Body() dto: UpdateRepromaterijalDto,
    ) {
        return this.service.update(sifraRepromaterijala, dto);
    }

    @Post('refresh')
    async refresh() {
        return this.service.seedFromErp();
    }
}
