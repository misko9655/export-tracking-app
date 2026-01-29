import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { Customer } from "../../../shared/customer"
import { CustomersService } from "./customers.service";


@Controller('customers')
export class CustomersController {
    constructor(private customerDB: CustomersService) {}
    
    @Post() 
    async createCustomer(@Body() customer: Partial<Customer>): Promise<Customer> {
        return this.customerDB.createCustomer(customer);
    }

    @Get()
    async getAllCustomers(): Promise<Customer[]> {
        console.log('Fetching all norms from DB');
        return this.customerDB.getAllCustomers();
    }

    @Put(':customerId')
    async updateCustomer(@Param() customerId: string, @Body() changes: Partial<Customer>): Promise<Customer | null> {
        return this.customerDB.updateCustomer(customerId, changes);
    }

    @Delete(':customerId')
    async deleteCustomer(@Param() customerId: string) {
        this.customerDB.deleteCustomer(customerId);
    }

}