import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { NormService } from "../services/norm.service";
import { Norm } from "src/model/norm";


@Controller('norms')
export class NormsController {
    constructor(private normDB: NormService) {}

    // @Get('items')
    // async getAllItems(): Promise<Item[]> {
    //     return this.itemsService.getAllItems();
    // }

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

    // @Get('api/norms')
    // async getAllNorms(): Promise<Norm[]> {
    //     const normss = [...NORM_DATA].map(n => {
    //         const newNorm = new Norm(
    //             '', 
    //             n._Normativ_Sifra,
    //             n._Normativ_JM,
    //             n._Element_Vrsta_Naziv,
    //             n._Element_Skladiste_ID,
    //             n._Element_Skladiste_Naziv,
    //             n._Element_Artikal_Sifra,
    //             n._Element_Artikal_Naziv,
    //             n._Element_Artikal_JM,
    //             parseInt(n._Element_Artikal_Kolicina)
    //         )
    //         this.normDB.createNorm(newNorm);
    //         return newNorm
    //     });
        
    //     return normss;
    // }
}