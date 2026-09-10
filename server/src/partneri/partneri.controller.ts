import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { PartneriService } from "./partneri.service";
import { CreatePartnerDto } from "./dto/create-partner.dto";
import { UpdatePartnerDto } from "./dto/update-partner.dto";
import { SuperAdminGuard } from "src/guards/super-admin.guard";

@Controller('partneri')
@UseGuards(SuperAdminGuard)
export class PartneriController {
    constructor(private readonly service: PartneriService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreatePartnerDto) {
        return this.service.create(dto);
    }

    @Get()
    async findAll() {
        return this.service.findAll();
    }

    @Patch(':sifraPartnera')
    async update(@Param('sifraPartnera') sifraPartnera: string, @Body() dto: UpdatePartnerDto) {
        return this.service.update(sifraPartnera, dto);
    }

    @Delete(':sifraPartnera')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('sifraPartnera') sifraPartnera: string) {
        return this.service.delete(sifraPartnera);
    }
}
