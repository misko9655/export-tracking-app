import { Controller, Get } from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller('products')
export class ProductsController {

    constructor(private readonly productsService: ProductsService) {}


    @Get('create-all-norms')
    async createAllNorms() {
        return this.productsService.returnAllNorms();
    }

}