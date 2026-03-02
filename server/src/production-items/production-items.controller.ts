import { Controller, Get } from "@nestjs/common";
import { ProductionItemsService } from "./production-items.service";


@Controller('production-items')
export class ProductionItemsController {
    constructor(private readonly productionItemsService: ProductionItemsService) {}

    @Get()
    async findAll() {
        return await this.productionItemsService.findAll();
    }
}