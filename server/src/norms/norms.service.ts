import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Norm, NormDocument } from "./norm.schema";
import { Model } from "mongoose";

import { data } from "./output";
import { CreateNormDto } from "./dto/create-norm.dto";


@Injectable()
export class NormsService {

    constructor(
        @InjectModel(Norm.name) private normModel: Model<NormDocument>
    ) {}

    async findAll(): Promise<Norm[]> {
        return this.normModel.find().exec();
    }

    // async save() {
    //     console.log(data.length);
    //     data.forEach(norm => {
    //         const newNorm: CreateNormDto = {
    //             elementItemCode: norm.elementItemCode,
    //             elementItemName: norm.elementItemName,
    //             elementItemQuantity: Number(norm.elementItemQuantity),
    //             elementItemUnitOfMeasure: norm.elementItemUnitOfMeasure,
    //             elementType: norm.elementType,
    //             elementWarehouseID: norm.elementWarehouseID,
    //             elementWarehouseName: norm.elementWarehouseName,
    //             normCode: norm.normCode
    //         };

    //         const createdNorm = new this.normModel(newNorm);
    //         createdNorm.save();
    //     });
    //     return this.normModel.find().exec;
    // }
}