import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }

    @Get()
    async findAll() {
        return this.customersService.findAll();
    }

    @Get('count')
    async countActiveCustomers() {
        const count = await this.customersService.countActiveCustomers();
        return { activeCustomers: count };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateCustomerDto: UpdateCustomerDto
    ) {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        return this.customersService.remove(id);
    }

    @Patch(':id/deactivate')
    async deactivate(@Param('id') id: string) {
        return this.customersService.deactivate(id);
    }

}
