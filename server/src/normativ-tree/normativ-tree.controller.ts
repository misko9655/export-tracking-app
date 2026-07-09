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

    @Get('all-with-tree')
    findAllWithTree() {
        return this.normativTreeService.findAllWithTree();
    }

    @Get('refresh-status')
    getRefreshStatus() {
        return {
            lastRefreshedAt: this.normativTreeService.getLastRefreshedAt(),
            apiAvailable: this.normativTreeService.isApiAvailable(),
        };
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.normativTreeService.findById(id);
    }
}
