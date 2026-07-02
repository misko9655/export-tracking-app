import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "path";
import { NormativTreeService } from "src/normativ-tree/normativ-tree.service";

const VALID_SKLADISTA = ['001', '002', '003', '004', '202', '802', '804', '903', '904'];

@Injectable()
export class LagerService {
    constructor(private normativTreeService: NormativTreeService) {}

    async findAll(skladisteId: string = '003') {
        let items: any[];

        if (process.env.USE_LOCAL_LAGER === 'true') {
            if (!VALID_SKLADISTA.includes(skladisteId)) {
                throw new NotFoundException(`Skladište ${skladisteId} nije dostupno`);
            }
            const filePath = join(process.cwd(), 'src', 'lager', 'mock-data', `${skladisteId}.json`);
            const raw = readFileSync(filePath, 'utf-8');
            items = JSON.parse(raw);
        } else {
            const response = await fetch(`http://10.197.0.20/Magacin/Magacin/Lager/${skladisteId}`);
            if (!response.ok) {
                throw new InternalServerErrorException('ERP API nije dostupan');
            }
            items = await response.json();
        }

        return items.map(item => ({
            ...item,
            artikalNaziv: this.normativTreeService.findArtikalByCode(item.artikalId)?.artikalNaziv ?? '',
        }));
    }
}
