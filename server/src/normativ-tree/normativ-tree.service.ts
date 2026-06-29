import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "path";

export type NormativListItem = { id: string; opis: string; jm: string; isActive: boolean };
type NormativTop = NormativListItem & { tree: any[] };

const NORMATIV_API_URL = 'http://10.197.0.20/Magacin/Magacin/GetNormative';

@Injectable()
export class NormativTreeService implements OnModuleInit {
    private readonly logger = new Logger(NormativTreeService.name);
    private normatives: NormativTop[] = [];
    private flatList: NormativListItem[] = [];

    async onModuleInit() {
        await this.loadFlatList();
        this.loadTree();
    }

    private async loadFlatList() {
        try {
            const response = await fetch(NORMATIV_API_URL, { signal: AbortSignal.timeout(8000) });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.flatList = await response.json();
            this.logger.log(`Učitano ${this.flatList.length} normativa sa API-ja`);
        } catch (err) {
            this.logger.warn(`API nije dostupan (${err.message}), koristim lokalni fallback`);
            const filePath = join(process.cwd(), 'src', 'normativ-tree', 'data', 'normative-flat.json');
            const raw = readFileSync(filePath, 'utf-8');
            this.flatList = JSON.parse(raw);
            this.logger.log(`Učitano ${this.flatList.length} normativa iz lokalnog fajla`);
        }
    }

    private loadTree() {
        const filePath = join(process.cwd(), 'src', 'normativ-tree', 'data', 'normative-tree.json');
        const raw = readFileSync(filePath, 'utf-8');
        this.normatives = JSON.parse(raw);
        this.logger.log(`Učitano ${this.normatives.length} normativa sa stablima`);
    }

    findAll(): NormativListItem[] {
        return this.flatList;
    }

    findById(id: string): NormativTop {
        const normativ = this.normatives.find(n => n.id === id);
        if (!normativ) throw new NotFoundException(`Normativ ${id} nije pronađen`);
        return normativ;
    }

    findGpItems(): any[] {
        const result: any[] = [];
        for (const normativ of this.normatives) {
            if (!normativ.isActive) continue;
            for (const branch of normativ.tree ?? []) {
                if (branch.vrsta === 2 && branch.skladisteId === '903') {
                    result.push(branch);
                }
            }
        }
        return result;
    }
}
