import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Norm, NormDocument } from "src/norms/norm.schema";
import { ReproItem, ReproItemDocument } from "./repro-item.schema";
import { CreateReproItemDto } from "./dto/raw-materials.dto";
import { UpdateReproItemDto } from "./dto/update-raw-materials.dto";


@Injectable()
export class ReproItemsService {
    constructor(
        @InjectModel(ReproItem.name) private reproItemsModel: Model<ReproItemDocument>,
        @InjectModel(Norm.name) private normModel: Model<NormDocument>
    ) {}

    async create(createReproItemDto: CreateReproItemDto): Promise<ReproItem> {
        const reproCode = createReproItemDto.reproCode;
        const repro = await this.normModel.findOne(
            {elementItemCode: reproCode}
        ).exec();
        if(!repro) {
            throw new NotFoundException(`Repromaterial not found!`);
        }
        const tmpReproItem = {...createReproItemDto};
        tmpReproItem.reproName = repro.elementItemName;
        tmpReproItem.reproUnitOfMeasure = repro.elementItemUnitOfMeasure;
        const createdOrderItem = new this.reproItemsModel(tmpReproItem);
        return createdOrderItem.save();
    }

    async findAll(): Promise<ReproItem[]> {
        return this.reproItemsModel.find().exec();
    }

    async update(id: string, updateReproItemDto: UpdateReproItemDto) {
        const updatedReproItem = await this.reproItemsModel
            .findByIdAndUpdate(id, updateReproItemDto, {returnDocument: 'after'})
            .exec();

        if(!updatedReproItem) {
            throw new NotFoundException(`Repro item with id ${id} not found`);
        }
        return updatedReproItem;
    }

    async delete(id: string): Promise<ReproItem> {
        const deletedReproItem = await this.reproItemsModel.findByIdAndDelete(id).exec();

        if(!deletedReproItem) {
            throw new NotFoundException(`Repro item with id ${id} not found`);
        }
        return deletedReproItem;
    }
}