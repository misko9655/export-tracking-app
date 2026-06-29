import { Controller, Get, Param } from "@nestjs/common";
import { NormativTreeService } from "./normativ-tree.service";

@Controller('normativ-tree')
export class NormativTreeController {
    constructor(private readonly normativTreeService: NormativTreeService) {}

    @Get()
    findAll() {
        return this.normativTreeService.findAll();
    }

    @Get('gp-items')
    findGpItems() {
        return this.normativTreeService.findGpItems();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.normativTreeService.findById(id);
    }
}
