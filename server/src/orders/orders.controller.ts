import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { NotViewerGuard } from "src/guards/not-viewer.guard";


@Controller('orders')
export class OrdersController {

    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @UseGuards(NotViewerGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @Get(':customerId')
    async findAllCustomerOrders(@Param('customerId') customerId: string) {
        return this.ordersService.findAllByCustomer(customerId);
    }

    @Get('find-one/:orderId')
    async findOneOrder(@Param('orderId') orderId: string) {
        return this.ordersService.findOne(orderId);
    }

    @Patch(':id')
    @UseGuards(NotViewerGuard)
    async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.ordersService.update(id, updateOrderDto);
    }

    @Delete(':id')
    @UseGuards(NotViewerGuard)
    async delete(@Param('id') id: string) {
        return this.ordersService.deleteOrderWithItems(id);
    }

    @Post(':id/comments')
    @UseGuards(NotViewerGuard)
    async addComment(
        @Param('id') id: string,
        @Body() body: { username: string; text: string },
    ) {
        return this.ordersService.addComment(id, body.username, body.text);
    }

    @Delete(':id/comments/:commentId')
    @UseGuards(NotViewerGuard)
    async deleteComment(
        @Param('id') id: string,
        @Param('commentId') commentId: string,
    ) {
        return this.ordersService.deleteComment(id, commentId);
    }
}