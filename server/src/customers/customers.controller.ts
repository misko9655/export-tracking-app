import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { PagePermissionGuard } from 'src/guards/page-permission.guard';
import { RequirePageEdit } from 'src/decorators/require-page-edit.decorator';

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
    @UseGuards(PagePermissionGuard)
    @RequirePageEdit('customers')
    async update(
        @Param('id') id: string,
        @Body() updateCustomerDto: UpdateCustomerDto
    ) {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    @UseGuards(PagePermissionGuard)
    @RequirePageEdit('customers')
    // @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        return this.customersService.deleteCustomerWithOrders(id);
    }

    @Patch(':id/deactivate')
    @UseGuards(PagePermissionGuard)
    @RequirePageEdit('customers')
    async deactivate(@Param('id') id: string) {
        return this.customersService.deactivate(id);
    }

}
