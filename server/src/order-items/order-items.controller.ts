import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { OrderItemsService } from "./order-items.service";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";


@Controller('order-items')
export class OrderItemsController {
    constructor(private readonly orderItemsService: OrderItemsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrderItemrDto: CreateOrderItemDto) {
        return this.orderItemsService.create(createOrderItemrDto);
    }
    
    @Get(':orderId')
    async findAll(@Param('orderId') orderId: string) {
        return this.orderItemsService.findAll(orderId);
    }
    
    
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateOrderItemDto: UpdateOrderItemDto
    ) {
        return this.orderItemsService.update(id, updateOrderItemDto);
    }
    
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
        return this.orderItemsService.delete(id);
    }

}