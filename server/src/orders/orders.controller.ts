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
        const tmp = await this.ordersService.findAllByCustomer(customerId);
        console.log(tmp);
        return tmp;
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
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
        return this.ordersService.delete(id);
    }
}