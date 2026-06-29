import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { CreateReproItemDto } from "./dto/raw-materials.dto";
import { ReproItemsService } from "./repro-items.service";
import { UpdateReproItemDto } from "./dto/update-raw-materials.dto";



@Controller('raw-materials')
export class ReproItemsController {
    constructor(private readonly reproItemsService: ReproItemsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrderItemrDto: CreateReproItemDto) {
        return this.reproItemsService.create(createOrderItemrDto);
    }
    
    @Get()
    async getAll() {
        return this.reproItemsService.findAll();
    }
    
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateReproItemDto: UpdateReproItemDto
    ) {
        return this.reproItemsService.update(id, updateReproItemDto);
    }
    
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
        return this.reproItemsService.delete(id);
    }

}