import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model} from "mongoose";
import { Norm } from "../../../shared/norm";

@Injectable()
export class NormService {
    constructor(@InjectModel('Norm') private normModel: Model<Norm>) {}

    async getAllNorms(): Promise<Norm[]> {
        return this.normModel.find()
    }

    async findNorm(normCode: string): Promise<Norm | null> {
        return this.normModel.findOne({
            normCode: normCode,
            elementWarehouseID: '903'
        })
    }

    async createNorm(normData: Partial<Norm>): Promise<Norm> {
        const newNorm = new this.normModel(normData);
        await newNorm.save();
        return newNorm.toObject({ versionKey: false });
    }

    updateNorm(normId: string, changes: Partial<Norm>): Promise<Norm | null> {
        return this.normModel.findOneAndUpdate(
            {_id: normId},
            changes,
            {new: true}
        );
    }

    deleteNorm(normId: string): Promise<Norm | null> {

        return this.normModel.findByIdAndDelete(normId).exec();
        
    }
}

