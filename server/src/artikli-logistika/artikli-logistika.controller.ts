import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ArtikliLogistikaService } from './artikli-logistika.service';
import { UpdateArtikalLogistikaDto } from './dto/update-artikal-logistika.dto';

@Controller('artikli-logistika')
export class ArtikliLogistikaController {
    constructor(private readonly service: ArtikliLogistikaService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Patch(':artikalId')
    update(
        @Param('artikalId') artikalId: string,
        @Body() dto: UpdateArtikalLogistikaDto,
    ) {
        return this.service.update(artikalId, dto);
    }
}
