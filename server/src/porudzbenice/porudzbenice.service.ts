import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Porudzbenica, PorudzbenicaDocument } from "./schemas/porudzbenica.schema";
import { Counter, CounterDocument } from "./schemas/counter.schema";
import { CreatePorudzbenicaDto } from "./dto/create-porudzbenica.dto";
import { AddStavkaDto } from "./dto/add-stavka.dto";
import { EventsGateway } from "src/events/events.gateway";

@Injectable()
export class PorudzbeniceService {
    constructor(
        @InjectModel(Porudzbenica.name) private model: Model<PorudzbenicaDocument>,
        @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
        private eventsGateway: EventsGateway,
    ) {}

    private async nextBroj(): Promise<string> {
        const year = new Date().getFullYear();
        const counter = await this.counterModel.findOneAndUpdate(
            { _id: `porudzbenica-${year}` },
            { $inc: { seq: 1 } },
            { upsert: true, returnDocument: 'after' },
        ).exec();
        return `PO-${year}-${String(counter!.seq).padStart(4, '0')}`;
    }

    async create(dto: CreatePorudzbenicaDto, username: string): Promise<Porudzbenica> {
        const brojPorudzbenice = await this.nextBroj();
        const created = new this.model({
            ...dto,
            brojPorudzbenice,
            kreiranaOd: username,
            status: 'kreirana',
            stavke: [],
        });
        const saved = await created.save();
        this.eventsGateway.broadcast('porudzbenica', 'created');
        return saved;
    }

    async findAll(): Promise<Porudzbenica[]> {
        return this.model.find().sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<Porudzbenica> {
        const porudzbenica = await this.model.findById(id).exec();
        if (!porudzbenica) throw new NotFoundException(`Porudžbenica sa id-em ${id} nije pronađena`);
        return porudzbenica;
    }

    async addStavka(id: string, dto: AddStavkaDto): Promise<Porudzbenica> {
        const updated = await this.model.findByIdAndUpdate(
            id,
            { $push: { stavke: dto } },
            { returnDocument: 'after' },
        ).exec();
        if (!updated) throw new NotFoundException(`Porudžbenica sa id-em ${id} nije pronađena`);
        this.eventsGateway.broadcast('porudzbenica', 'updated', { id });
        return updated;
    }

    async removeStavka(id: string, stavkaId: string): Promise<Porudzbenica> {
        const updated = await this.model.findByIdAndUpdate(
            id,
            { $pull: { stavke: { _id: new Types.ObjectId(stavkaId) } } },
            { returnDocument: 'after' },
        ).exec();
        if (!updated) throw new NotFoundException(`Porudžbenica sa id-em ${id} nije pronađena`);
        this.eventsGateway.broadcast('porudzbenica', 'updated', { id });
        return updated;
    }

    async updateStatus(id: string, status: string): Promise<Porudzbenica> {
        const updated = await this.model.findByIdAndUpdate(
            id,
            { $set: { status } },
            { returnDocument: 'after' },
        ).exec();
        if (!updated) throw new NotFoundException(`Porudžbenica sa id-em ${id} nije pronađena`);
        this.eventsGateway.broadcast('porudzbenica', 'updated', { id });
        return updated;
    }
}
