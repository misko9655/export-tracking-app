import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { PorudzbeniceService } from "./porudzbenice.service";
import { CreatePorudzbenicaDto } from "./dto/create-porudzbenica.dto";
import { AddStavkaDto } from "./dto/add-stavka.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { SuperAdminGuard } from "src/guards/super-admin.guard";

@Controller('porudzbenice')
@UseGuards(SuperAdminGuard)
export class PorudzbeniceController {
    constructor(private readonly service: PorudzbeniceService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreatePorudzbenicaDto, @Req() req: any) {
        return this.service.create(dto, req.user.username);
    }

    @Get()
    async findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post(':id/stavke')
    async addStavka(@Param('id') id: string, @Body() dto: AddStavkaDto) {
        return this.service.addStavka(id, dto);
    }

    @Delete(':id/stavke/:stavkaId')
    async removeStavka(@Param('id') id: string, @Param('stavkaId') stavkaId: string) {
        return this.service.removeStavka(id, stavkaId);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
        return this.service.updateStatus(id, dto.status);
    }
}
