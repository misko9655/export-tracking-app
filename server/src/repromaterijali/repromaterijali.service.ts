import { Injectable, InternalServerErrorException, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Repromaterijal, RepromaterijalDocument } from "./schemas/repromaterijal.schema";
import { UpdateRepromaterijalDto } from "./dto/update-repromaterijal.dto";
import { NormativTreeService } from "src/normativ-tree/normativ-tree.service";
import { ArtikliLogistikaService } from "src/artikli-logistika/artikli-logistika.service";
import { EventsGateway } from "src/events/events.gateway";

// Isti prefiks po magacinu kao PREFIX_FILTERED_SKLADISTA u LagerService - ERP
// Lager endpoint vraca i "duh" zapise (nulta kolicina) za artikle iz drugih
// domena, prefiks ih odbacuje. Namerno dupliran ovde (ne uvoz iz LagerService)
// da bi se izbegla kruzna zavisnost modula: LagerModule ce da uveze
// RepromaterijaliModule (za popunu naziva/JM na Lager stranici), pa
// RepromaterijaliModule ne sme da zavisi od LagerModule.
const MAGACIN_PREFIX: Record<string, string> = {
    '002': '2',
    '004': '4',
};

@Injectable()
export class RepromaterijaliService implements OnModuleInit {
    private readonly logger = new Logger(RepromaterijaliService.name);

    constructor(
        @InjectModel(Repromaterijal.name) private model: Model<RepromaterijalDocument>,
        private normativTreeService: NormativTreeService,
        private artikliLogistikaService: ArtikliLogistikaService,
        private eventsGateway: EventsGateway,
    ) {}

    onModuleInit() {
        this.seedFromErp().catch(err =>
            this.logger.error('Greška pri seed-ovanju repromaterijala', err)
        );
    }

    private async fetchAndTag(skladisteId: string, tip: 'sirovina' | 'ambalaza') {
        try {
            const response = await fetch(
                `http://10.197.0.20/Magacin/Magacin/Lager/${skladisteId}`,
                { signal: AbortSignal.timeout(20000) }
            );
            if (!response.ok) throw new InternalServerErrorException('ERP API nije dostupan');
            const rawItems: any[] = await response.json();

            const prefix = MAGACIN_PREFIX[skladisteId];
            const items = prefix ? rawItems.filter(item => String(item.artikalId).startsWith(prefix)) : rawItems;

            await this.normativTreeService.whenReady();
            const jmData = await this.artikliLogistikaService.findJmData();

            return items.map(item => {
                const jm = jmData.get(item.artikalId);
                return {
                    sifraRepromaterijala: item.artikalId,
                    nazivRepromaterijala: this.normativTreeService.findArtikalNaziv(item.artikalId),
                    jedinicaMere: jm?.artikalJm || this.normativTreeService.findArtikalJm(item.artikalId),
                    tipRepromaterijala: tip,
                };
            });
        } catch (err: any) {
            this.logger.warn(`Magacin ${skladisteId} nedostupan pri osvežavanju repromaterijala: ${err.message}`);
            return [];
        }
    }

    async seedFromErp(): Promise<{ created: number; matched: number }> {
        const [sirovine, ambalaza] = await Promise.all([
            this.fetchAndTag('002', 'sirovina'),
            this.fetchAndTag('004', 'ambalaza'),
        ]);
        const svi = [...sirovine, ...ambalaza];
        if (!svi.length) return { created: 0, matched: 0 };

        const ops = svi.map(r => ({
            updateOne: {
                filter: { sifraRepromaterijala: r.sifraRepromaterijala },
                // $setOnInsert (ne $set) za naziv/JM/tip - jednom uneto se ne
                // prepisuje svakim seed-om, da rucne korekcije (npr. artikal bez
                // naziva sa ERP-a) preziva osvezavanje. Isti obrazac kao
                // ArtikliLogistikaService.seedArtikli().
                update: { $setOnInsert: r },
                upsert: true,
            },
        }));
        const result = await this.model.bulkWrite(ops);
        this.logger.log(`Osvežavanje repromaterijala: ${result.upsertedCount} novih, ${result.matchedCount} postojećih`);
        this.eventsGateway.broadcast('repromaterijal', 'updated');
        return { created: result.upsertedCount, matched: result.matchedCount };
    }

    async findAll(): Promise<Repromaterijal[]> {
        return this.model.find().sort({ sifraRepromaterijala: 1 }).exec();
    }

    // Koristi ga LagerService kao dodatni fallback za naziv/JM na magacinima
    // 002/802/004/804, kad ni normativ stablo ni artikli-logistika nemaju
    // podatak - repromaterijali mogu biti rucno dopunjeni preko ove stranice
    // (npr. artikal koji ERP ne prijavljuje sa nazivom).
    async findLookupMap(): Promise<Map<string, { nazivRepromaterijala: string; jedinicaMere: string }>> {
        const rows = await this.model
            .find({}, { sifraRepromaterijala: 1, nazivRepromaterijala: 1, jedinicaMere: 1 })
            .lean()
            .exec();
        return new Map(rows.map(r => [
            r.sifraRepromaterijala,
            { nazivRepromaterijala: r.nazivRepromaterijala ?? '', jedinicaMere: r.jedinicaMere ?? '' },
        ]));
    }

    async update(sifraRepromaterijala: string, dto: UpdateRepromaterijalDto): Promise<Repromaterijal> {
        const updated = await this.model
            .findOneAndUpdate({ sifraRepromaterijala }, { $set: dto }, { returnDocument: 'after' })
            .exec();
        if (!updated) throw new NotFoundException(`Repromaterijal ${sifraRepromaterijala} nije pronađen`);
        this.eventsGateway.broadcast('repromaterijal', 'updated', { sifraRepromaterijala });
        return updated;
    }
}
