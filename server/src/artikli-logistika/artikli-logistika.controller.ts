import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ArtikliLogistikaService } from './artikli-logistika.service';
import { UpdateArtikalLogistikaDto } from './dto/update-artikal-logistika.dto';
import { NotViewerGuard } from 'src/guards/not-viewer.guard';

@Controller('artikli-logistika')
export class ArtikliLogistikaController {
    constructor(private readonly service: ArtikliLogistikaService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Patch(':artikalId')
    @UseGuards(NotViewerGuard)
    update(
        @Param('artikalId') artikalId: string,
        @Body() dto: UpdateArtikalLogistikaDto,
    ) {
        return this.service.update(artikalId, dto);
    }
}
