import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { OrderItemsService } from "./order-items.service";
import { CreateOrderItemDto } from "./dto/create-order-item.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";
import { PagePermissionGuard } from "src/guards/page-permission.guard";
import { RequirePageEdit } from "src/decorators/require-page-edit.decorator";
import { AdminGuard } from "src/guards/admin.guard";


@Controller('order-items')
export class OrderItemsController {
    constructor(private readonly orderItemsService: OrderItemsService) {}

    @Post()
    @UseGuards(PagePermissionGuard)
    @RequirePageEdit('customers')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrderItemrDto: CreateOrderItemDto) {
        return this.orderItemsService.create(createOrderItemrDto);
    }

    @Post('update-logistics')
    @UseGuards(AdminGuard)
    async updateLogistics() {
        return this.orderItemsService.updateLogistics();
    }

    @Post('multiple')
    @UseGuards(PagePermissionGuard)
    @RequirePageEdit('customers')
    @HttpCode(HttpStatus.CREATED)
    async createMultiple(@Body() createOrderItemrDto: CreateOrderItemDto[]) {
        return this.orderItemsService.createMultiple(createOrderItemrDto);
    }

    @Get(':orderId')
    async findAll(@Param('orderId') orderId: string) {
        return this.orderItemsService.findAll(orderId);
    }


    @Patch(':id')
    @UseGuards(PagePermissionGuard)
    @RequirePageEdit('customers')
    async update(
        @Param('id') id: string,
        @Body() updateOrderItemDto: UpdateOrderItemDto
    ) {
        return this.orderItemsService.update(id, updateOrderItemDto);
    }

    @Delete(':id')
    @UseGuards(PagePermissionGuard)
    @RequirePageEdit('customers')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
        return this.orderItemsService.delete(id);
    }

}