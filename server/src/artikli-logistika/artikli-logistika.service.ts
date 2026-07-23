import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ArtikalLogistika, ArtikalLogistikaDocument } from './artikal-logistika.schema';
import { UpdateArtikalLogistikaDto } from './dto/update-artikal-logistika.dto';
import { NormativTreeService } from 'src/normativ-tree/normativ-tree.service';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class ArtikliLogistikaService implements OnModuleInit {
    private readonly logger = new Logger(ArtikliLogistikaService.name);

    constructor(
        @InjectModel(ArtikalLogistika.name) private model: Model<ArtikalLogistikaDocument>,
        private normativTreeService: NormativTreeService,
        private eventsGateway: EventsGateway,
    ) {}

    onModuleInit() {
        this.seedArtikli().catch(err =>
            this.logger.error('Greška pri seed-ovanju artikala', err)
        );
    }

    private async seedArtikli() {
        await this.normativTreeService.whenReady();
        const artikli = this.normativTreeService.findAllArtikli();
        if (!artikli.length) {
            this.logger.warn('Nema artikala za seed (artikalMap je prazan)');
            return;
        }

        const ops = artikli.map(a => ({
            updateOne: {
                filter: { artikalId: a.artikalId },
                update: {
                    $setOnInsert: {
                        artikalNaziv: a.artikalNaziv,
                        artikalJmUTp: a.artikalJmUTp,
                        artikalJm: a.artikalJm,
                        paketaNapaleti: 0,
                        visinaJed: 0, sirinaJed: 0, dubinaJed: 0,
                        nettoTezinaJed: 0, bruttoTezinaJed: 0,
                        visinaTP: 0, sirinaTP: 0, dubinaTP: 0,
                        nettoTezinaTP: 0, bruttoTezinaTP: 0,
                    },
                },
                upsert: true,
            },
        }));

        const result = await this.model.bulkWrite(ops);
        this.logger.log(`Seed artikala: ${result.upsertedCount} novih, ${result.matchedCount} postojećih`);
    }

    async findAll(): Promise<ArtikalLogistika[]> {
        return this.model.find().sort({ artikalId: 1 }).exec();
    }

    async findByCode(artikalId: string): Promise<ArtikalLogistika | null> {
        return this.model.findOne({ artikalId }).exec();
    }

    async findJmData(): Promise<Map<string, { artikalJm: string; artikalJmUTp: number }>> {
        const rows = await this.model.find({}, { artikalId: 1, artikalJm: 1, artikalJmUTp: 1 }).lean().exec();
        return new Map(rows.map(r => [r.artikalId, { artikalJm: r.artikalJm ?? '', artikalJmUTp: r.artikalJmUTp ?? 0 }]));
    }

    async update(artikalId: string, dto: UpdateArtikalLogistikaDto): Promise<ArtikalLogistika> {
        const updated = await this.model.findOneAndUpdate(
            { artikalId },
            { $set: dto },
            { returnDocument: 'after' },
        ).exec();
        if (!updated) throw new NotFoundException(`Artikal ${artikalId} nije pronađen`);
        this.eventsGateway.broadcast('artikal-logistika', 'updated', { artikalId });
        return updated;
    }
}
