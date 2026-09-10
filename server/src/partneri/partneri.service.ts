import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Partner, PartnerDocument } from "./schemas/partner.schema";
import { CreatePartnerDto } from "./dto/create-partner.dto";
import { UpdatePartnerDto } from "./dto/update-partner.dto";
import { EventsGateway } from "src/events/events.gateway";

@Injectable()
export class PartneriService {
    constructor(
        @InjectModel(Partner.name) private model: Model<PartnerDocument>,
        private eventsGateway: EventsGateway,
    ) {}

    async create(dto: CreatePartnerDto): Promise<Partner> {
        const existing = await this.model.findOne({ sifraPartnera: dto.sifraPartnera }).exec();
        if (existing) {
            throw new ConflictException(`Partner sa šifrom ${dto.sifraPartnera} već postoji`);
        }
        const created = new this.model(dto);
        const saved = await created.save();
        this.eventsGateway.broadcast('partner', 'created');
        return saved;
    }

    async findAll(): Promise<Partner[]> {
        return this.model.find().sort({ sifraPartnera: 1 }).exec();
    }

    async update(sifraPartnera: string, dto: UpdatePartnerDto): Promise<Partner> {
        const updated = await this.model
            .findOneAndUpdate({ sifraPartnera }, { $set: dto }, { returnDocument: 'after' })
            .exec();
        if (!updated) throw new NotFoundException(`Partner sa šifrom ${sifraPartnera} nije pronađen`);
        this.eventsGateway.broadcast('partner', 'updated', { sifraPartnera });
        return updated;
    }

    async delete(sifraPartnera: string): Promise<void> {
        // Trajno brisanje (ne meko kao artikli-logistika) - ova kolekcija se ne
        // reseed-uje sa ERP-a, pa nema rizika da se obrisan partner "vrati".
        const result = await this.model.findOneAndDelete({ sifraPartnera }).exec();
        if (!result) throw new NotFoundException(`Partner sa šifrom ${sifraPartnera} nije pronađen`);
        this.eventsGateway.broadcast('partner', 'deleted', { sifraPartnera });
    }
}
