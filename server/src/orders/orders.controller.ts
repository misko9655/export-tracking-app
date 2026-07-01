import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";


@Controller('orders')
export class OrdersController {

    constructor(private readonly ordersService: OrdersService) {}

    @Post()
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
    async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.ordersService.update(id, updateOrderDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.ordersService.deleteOrderWithItems(id);
    }

    @Post(':id/comments')
    async addComment(
        @Param('id') id: string,
        @Body() body: { username: string; text: string },
    ) {
        return this.ordersService.addComment(id, body.username, body.text);
    }

    @Delete(':id/comments/:commentId')
    async deleteComment(
        @Param('id') id: string,
        @Param('commentId') commentId: string,
    ) {
        return this.ordersService.deleteComment(id, commentId);
    }
}