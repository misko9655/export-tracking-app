import { Controller, Get } from "@nestjs/common";
import { NormsService } from "./norms.service";

@Controller('norms')
export class NormsController {
    constructor(private readonly normsService: NormsService) {}

    @Get()
    async findAll() {
        return this.normsService.findAll();
    }

    // @Get('save')
    // async saveToDb() {
    //     return this.normsService.save();
    // }

}