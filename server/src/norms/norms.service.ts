import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Norm, NormDocument } from "./norm.schema";
import { Model } from "mongoose";


@Injectable()
export class NormsService {

    constructor(
        @InjectModel(Norm.name) private normModel: Model<NormDocument>
    ) {}

    async findAll(): Promise<Norm[]> {
        return this.normModel.find().exec();
    }
}