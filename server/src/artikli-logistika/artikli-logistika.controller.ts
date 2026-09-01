import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ArtikliLogistikaService } from './artikli-logistika.service';
import { UpdateArtikalLogistikaDto } from './dto/update-artikal-logistika.dto';
import { BulkDeleteArtikliDto } from './dto/bulk-delete-artikli.dto';
import { BulkUpdateArtikliDto } from './dto/bulk-update-artikli.dto';
import { PagePermissionGuard } from 'src/guards/page-permission.guard';
import { RequirePageEdit } from 'src/decorators/require-page-edit.decorator';
import { AdminGuard } from 'src/guards/admin.guard';

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

    @Delete(':artikalId')
    @UseGuards(AdminGuard)
    delete(@Param('artikalId') artikalId: string) {
        return this.service.delete(artikalId);
    }

    @Post('bulk-delete')
    @UseGuards(AdminGuard)
    bulkDelete(@Body() dto: BulkDeleteArtikliDto) {
        return this.service.deleteMany(dto.artikalIds);
    }

    @Post('bulk-update')
    @UseGuards(PagePermissionGuard)
    @RequirePageEdit('artikliLogistika')
    bulkUpdate(@Body() dto: BulkUpdateArtikliDto) {
        return this.service.bulkUpdate(dto.updates);
    }
}
