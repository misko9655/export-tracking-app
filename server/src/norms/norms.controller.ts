import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { NormService } from "./norm.service";
import { Norm } from "../../../shared/norm";


@Controller('norms')
export class NormsController {
    constructor(private normDB: NormService) {}

    @Post()
    async createNorm(@Body() norm: Partial<Norm>): Promise<Norm> {
        return this.normDB.createNorm(norm);
    }


    @Get()
    async getAllNorms(): Promise<Norm[]> {
        console.log('Fetching all norms from DB');
        return this.normDB.getAllNorms();
    }

    @Put(':normId')
    async updateNorm(
        @Param('normId') normId: string,
        @Body() changes: Partial<Norm>
    ): Promise<Norm | null> {
        return this.normDB.updateNorm(normId, changes);
    }

    @Delete(':normId') 
    async deleteNorm(@Param('normId') normId:string) {
        this.normDB.deleteNorm(normId);
    }


}