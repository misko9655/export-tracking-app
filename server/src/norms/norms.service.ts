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
    ) { }

    async findAll(): Promise<Norm[]> {
        console.log('ovde sam');
        return this.normModel.find().exec();
    }

    async save() {
        console.log(data.length);
        for (const norm of data) {
            const newNorm: CreateNormDto = {
                elementItemCode: String(norm._Element_Artikal_Sifra),
                elementItemName: String(norm._Element_Artikal_Naziv),
                elementItemQuantity: this.toNumberWithoutRounding(norm._Element_Artikal_Kolicina, 5),
                elementItemUnitOfMeasure: String(norm._Element_Artikal_JM),
                elementType: String(norm._Element_Vrsta_Naziv),
                elementWarehouseID: String(norm._Element_Skladiste_ID),
                elementWarehouseName: String(norm._Element_Skladiste_Naziv),
                normCode: String(norm._Normativ_Sifra)
            };
            const createdNorm = new this.normModel(newNorm);
            await createdNorm.save();
        }
        return this.normModel.find().exec();
    }

    toNumberWithoutRounding(numStr, decimals) {
        const dotIndex = numStr.indexOf('.');

        // If no decimal point, just return as number
        if (dotIndex === -1) return Number(numStr);

        // Trim to requested decimals without rounding
        const trimmed = numStr.slice(0, dotIndex + decimals + 1);

        // Convert to number
        return Number(trimmed);
    }
}