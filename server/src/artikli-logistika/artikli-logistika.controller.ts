import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ArtikliLogistikaService } from './artikli-logistika.service';
import { UpdateArtikalLogistikaDto } from './dto/update-artikal-logistika.dto';
import { PagePermissionGuard } from 'src/guards/page-permission.guard';
import { RequirePageEdit } from 'src/decorators/require-page-edit.decorator';

@Controller('artikli-logistika')
export class ArtikliLogistikaController {
    constructor(private readonly service: ArtikliLogistikaService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Patch(':artikalId')
    @UseGuards(PagePermissionGuard)
    @RequirePageEdit('artikliLogistika')
    update(
        @Param('artikalId') artikalId: string,
        @Body() dto: UpdateArtikalLogistikaDto,
    ) {
        return this.service.update(artikalId, dto);
    }
}
