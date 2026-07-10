import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "path";
import { NormativTreeService } from "src/normativ-tree/normativ-tree.service";

const VALID_SKLADISTA = ['001', '002', '003', '004', '202', '802', '804', '903', '904'];

@Injectable()
export class LagerService {
    constructor(private normativTreeService: NormativTreeService) {}

    async findAll(skladisteId: string = '003'): Promise<{ items: any[]; usedFallback: boolean }> {
        let items: any[];
        let usedFallback = false;

        if (process.env.USE_LOCAL_LAGER === 'true') {
            if (!VALID_SKLADISTA.includes(skladisteId)) {
                throw new NotFoundException(`Skladište ${skladisteId} nije dostupno`);
            }
            const filePath = join(process.cwd(), 'src', 'lager', 'mock-data', `${skladisteId}.json`);
            const raw = readFileSync(filePath, 'utf-8');
            items = JSON.parse(raw);
            usedFallback = true;
        } else {
            let response: Response;
            try {
                response = await fetch(
                    `http://10.197.0.20/Magacin/Magacin/Lager/${skladisteId}`,
                    { signal: AbortSignal.timeout(20000) }
                );
            } catch {
                throw new InternalServerErrorException('ERP API nije dostupan (timeout ili mrežna greška)');
            }
            if (!response.ok) {
                throw new InternalServerErrorException('ERP API nije dostupan');
            }
            try {
                items = await response.json();
            } catch {
                throw new InternalServerErrorException('ERP API je vratio neispravan odgovor');
            }
        }

        return {
            items: items.map(item => ({
                ...item,
                artikalNaziv: this.normativTreeService.findArtikalNaziv(item.artikalId),
            })),
            usedFallback,
        };
    }
}
