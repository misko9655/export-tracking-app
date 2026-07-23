import { Controller, Get, Param } from "@nestjs/common";
import { NormativTreeService } from "./normativ-tree.service";

@Controller('normativ-tree')
export class NormativTreeController {
    constructor(private readonly normativTreeService: NormativTreeService) {}

    @Get()
    async findAll() {
        await this.normativTreeService.whenReady();
        return this.normativTreeService.findAll();
    }

    @Get('gp-items')
    async findGpItems() {
        await this.normativTreeService.whenReady();
        return this.normativTreeService.findGpItems();
    }

    @Get('all-with-tree')
    async findAllWithTree() {
        await this.normativTreeService.whenReady();
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
    async findById(@Param('id') id: string) {
        await this.normativTreeService.whenReady();
        return this.normativTreeService.findById(id);
    }
}
