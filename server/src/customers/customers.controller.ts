import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { NotViewerGuard } from 'src/guards/not-viewer.guard';

@Controller('customers')
@UseGuards(AuthenticationGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Post()
    @UseGuards(AdminGuard)
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
    @UseGuards(NotViewerGuard)
    async update(
        @Param('id') id: string,
        @Body() updateCustomerDto: UpdateCustomerDto
    ) {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    @UseGuards(NotViewerGuard)
    // @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        return this.customersService.deleteCustomerWithOrders(id);
    }

    @Patch(':id/deactivate')
    @UseGuards(NotViewerGuard)
    async deactivate(@Param('id') id: string) {
        return this.customersService.deactivate(id);
    }

}
