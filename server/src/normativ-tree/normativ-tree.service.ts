import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { Model } from "mongoose";
import { readFileSync } from "fs";
import { join } from "path";
import { OrderItem, OrderItemDocument } from "src/order-items/order-item.schema";

export type NormativListItem = { id: string; opis: string; jm: string; isActive: boolean };
export type NormativTop = NormativListItem & { tree: any[]; treeError: any };
export type ArtikalItem = { artikalId: string; artikalNaziv: string; artikalJmUTp: number; artikalJm: string };

const NORMATIV_API_URL = 'http://10.197.0.20/Magacin/Magacin/GetNormative';
const TREE_API_BASE = 'http://10.197.0.20/Magacin/Magacin/GetNormativTree';
const REFRESH_BATCH_SIZE = 20;

@Injectable()
export class NormativTreeService implements OnModuleInit {
    private readonly logger = new Logger(NormativTreeService.name);
    private normatives: NormativTop[] = [];
    private flatList: NormativListItem[] = [];
    private normativMap = new Map<string, NormativTop>();
    private artikalMap = new Map<string, ArtikalItem>();
    private apiAvailable = false;
    private lastRefreshedAt: Date | null = null;

    constructor(
        @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
    ) {}

    async onModuleInit() {
        await this.loadFlatList();
        await this.loadTree();
        await this.loadArtikli();
        this.lastRefreshedAt = new Date();
    }

    private async loadFlatList() {
        try {
            const response = await fetch(NORMATIV_API_URL, { signal: AbortSignal.timeout(8000) });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const raw: any[] = await response.json();
            this.flatList = raw.map(item => ({ ...item, id: String(item.id) }));
            this.apiAvailable = true;
            this.logger.log(`Učitano ${this.flatList.length} normativa sa API-ja`);
        } catch (err) {
            this.logger.warn(`API nije dostupan (${(err as any).message}), koristim lokalni fallback`);
            const filePath = join(process.cwd(), 'src', 'normativ-tree', 'data', 'normative-flat.json');
            const raw = readFileSync(filePath, 'utf-8');
            this.flatList = JSON.parse(raw);
            this.logger.log(`Učitano ${this.flatList.length} normativa iz lokalnog fajla`);
        }
    }

    private parseTreeResponse(raw: any, flatItem: NormativListItem): NormativTop | null {
        if (!raw) return null;

        // Slučaj 1: API vraća kompletan NormativTop objekat { id, opis, jm, isActive, tree, treeError }
        if (raw.tree !== undefined) {
            return {
                id: String(raw.id ?? flatItem.id),
                opis: raw.opis ?? flatItem.opis,
                jm: raw.jm ?? flatItem.jm,
                isActive: raw.isActive ?? flatItem.isActive,
                tree: Array.isArray(raw.tree) ? raw.tree : [],
                treeError: raw.treeError ?? null,
            };
        }

        // Slučaj 2: API vraća samo niz (tree array direktno)
        if (Array.isArray(raw)) {
            return { ...flatItem, tree: raw, treeError: null };
        }

        return null;
    }

    private async loadTree() {
        const BATCH_SIZE = 20;
        const normatives: NormativTop[] = [];
        let failCount = 0;
        let firstResponseLogged = false;

        if (!this.apiAvailable) {
            this.logger.warn(`API nije dostupan, preskačem API pozive za stabla normativa`);
        } else try {
            for (let i = 0; i < this.flatList.length; i += BATCH_SIZE) {
                const batch = this.flatList.slice(i, i + BATCH_SIZE);
                const results = await Promise.allSettled(
                    batch.map(item =>
                        fetch(`${TREE_API_BASE}/${item.id}`, { signal: AbortSignal.timeout(10000) })
                            .then(async res => {
                                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                const raw = await res.json();
                                if (!firstResponseLogged) {
                                    this.logger.log(`GetNormativTree primer odgovora: ${JSON.stringify(raw).slice(0, 300)}`);
                                    firstResponseLogged = true;
                                }
                                const normativ = this.parseTreeResponse(raw, item);
                                if (!normativ) throw new Error('Nepoznat format odgovora');
                                return normativ;
                            })
                    )
                );

                for (const result of results) {
                    if (result.status === 'fulfilled') {
                        normatives.push(result.value);
                    } else {
                        failCount++;
                    }
                }
            }
        } catch (err) {
            this.logger.warn(`Neočekivana greška pri učitavanju stabla (${(err as any).message})`);
        }

        if (normatives.length > 0) {
            if (failCount > 0) {
                this.logger.warn(`${failCount} normativa nije učitano sa API-ja`);
            }
            this.normatives = normatives;
            this.logger.log(`Učitano ${normatives.length} normativa sa stablom sa API-ja`);
        } else {
            this.logger.warn(`API za stablo nije vratio podatke, koristim lokalni fallback`);
            const filePath = join(process.cwd(), 'src', 'normativ-tree', 'data', 'normative-tree.json');
            this.normatives = JSON.parse(readFileSync(filePath, 'utf-8'));
            this.logger.log(`Učitano ${this.normatives.length} normativa iz lokalnog fajla`);
        }

        this.rebuildNormativMap();
        this.logger.log(`${this.normativMap.size} GP normativa indeksirano`);
    }

    private rebuildNormativMap() {
        this.normativMap.clear();
        for (const normativ of this.normatives) {
            const gp = normativ.tree?.[0];
            if (gp?.vrsta === 2 && gp?.skladisteId === '903') {
                this.normativMap.set(String(gp.artikalId), normativ);
            }
        }
    }

    private async fetchTreeForId(id: string, flatItem: NormativListItem): Promise<NormativTop | null> {
        try {
            const res = await fetch(`${TREE_API_BASE}/${id}`, { signal: AbortSignal.timeout(10000) });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const raw = await res.json();
            return this.parseTreeResponse(raw, flatItem);
        } catch {
            return null;
        }
    }

    private async getActiveNormativIds(): Promise<string[]> {
        const results = await this.orderItemModel.aggregate([
            { $match: { normativId: { $ne: '' } } },
            { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
            { $unwind: '$order' },
            { $match: { 'order.state': { $in: ['created', 'loading'] } } },
            { $group: { _id: '$normativId' } },
        ]);
        return results.map(r => r._id);
    }

    @Cron('*/15 * * * *')
    async refreshActiveNormativs() {
        try {
            const activeIds = await this.getActiveNormativIds();
            if (activeIds.length === 0) {
                this.lastRefreshedAt = new Date();
                return;
            }

            for (let i = 0; i < activeIds.length; i += REFRESH_BATCH_SIZE) {
                const batch = activeIds.slice(i, i + REFRESH_BATCH_SIZE);
                const results = await Promise.allSettled(
                    batch.map(id => {
                        const flatItem = this.flatList.find(f => f.id === id)
                            ?? { id, opis: '', jm: '', isActive: true };
                        return this.fetchTreeForId(id, flatItem);
                    })
                );

                for (const result of results) {
                    if (result.status === 'fulfilled' && result.value) {
                        const idx = this.normatives.findIndex(n => n.id === result.value!.id);
                        if (idx >= 0) {
                            this.normatives[idx] = result.value;
                        } else {
                            this.normatives.push(result.value);
                        }
                    }
                }
            }

            this.rebuildNormativMap();
            this.lastRefreshedAt = new Date();
            this.logger.log(`Osveženo ${activeIds.length} aktivnih normativa`);
        } catch (err) {
            this.logger.warn(`Greška pri periodičnom osvežavanju normativa (${(err as any).message})`);
        }
    }

    getLastRefreshedAt(): Date | null {
        return this.lastRefreshedAt;
    }

    private loadArtikli() {
        const filePath = join(process.cwd(), 'src', 'normativ-tree', 'data', 'artikli.json');
        const raw = readFileSync(filePath, 'utf-8');
        const artikli: ArtikalItem[] = JSON.parse(raw);
        for (const artikal of artikli) {
            this.artikalMap.set(artikal.artikalId, artikal);
        }
        this.logger.log(`Učitano ${this.artikalMap.size} artikala`);
    }

    findAll(): NormativListItem[] {
        return this.flatList;
    }

    findAllWithTree(): NormativTop[] {
        return this.normatives;
    }

    findByCode(code: string): NormativTop | undefined {
        return this.normativMap.get(String(code).toUpperCase().trim());
    }

    findById(id: string): NormativTop {
        const normativ = this.normatives.find(n => String(n.id) === String(id));
        if (!normativ) throw new NotFoundException(`Normativ ${id} nije pronađen`);
        return normativ;
    }

    findArtikalByCode(code: string): ArtikalItem | undefined {
        return this.artikalMap.get(String(code).toUpperCase().trim());
    }

    findAllArtikli(): ArtikalItem[] {
        return Array.from(this.artikalMap.values());
    }

    findGpItems(): any[] {
        return Array.from(this.normativMap.values())
            .filter(n => n.isActive)
            .map(n => n.tree[0]);
    }
}
