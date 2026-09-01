import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "path";
import { NormativTreeService } from "src/normativ-tree/normativ-tree.service";
import { ArtikliLogistikaService } from "src/artikli-logistika/artikli-logistika.service";

const VALID_SKLADISTA = ['101', '002', '003', '004', '202', '802', '804', '903', '904'];

// Za ova skladišta je na stvarnim podacima potvrđeno da SVAKA stavka sa
// nenultom količinom ima šifru koja počinje ovim prefiksom (sirovine "2xxx",
// ambalaža "4xxx") - ERP-ov Lager endpoint inače vraća i "duh" zapise (nulta
// količina) za artikle iz drugih domena (npr. gotovi proizvod) koji su nekad
// bili registrovani na tom skladištu. Namerno se NE primenjuje na 101/003/202/
// 903/904 - ta skladišta legitimno drže mešovitu robu (potvrđeno na podacima:
// 101 ima realnu zalihu i van "1xxx" prefiksa, a 003/202/903/904 su mešoviti
// po prirodi).
const PREFIX_FILTERED_SKLADISTA: Record<string, string> = {
    '002': '2',
    '802': '2',
    '004': '4',
    '804': '4',
};

@Injectable()
export class LagerService {
    constructor(
        private normativTreeService: NormativTreeService,
        private artikliLogistikaService: ArtikliLogistikaService,
    ) {}

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

        const requiredPrefix = PREFIX_FILTERED_SKLADISTA[skladisteId];
        if (requiredPrefix) {
            items = items.filter(item => String(item.artikalId).startsWith(requiredPrefix));
        }

        const jmData = await this.artikliLogistikaService.findJmData();
        await this.normativTreeService.whenReady();

        return {
            items: items.map(item => {
                const jm = jmData.get(item.artikalId);
                return {
                    ...item,
                    artikalNaziv: this.normativTreeService.findArtikalNaziv(item.artikalId),
                    artikalJm: jm?.artikalJm || this.normativTreeService.findArtikalJm(item.artikalId),
                    artikalJmUTp: jm?.artikalJmUTp || this.normativTreeService.findArtikalByCode(item.artikalId)?.artikalJmUTp || 0,
                };
            }),
            usedFallback,
        };
    }
}
