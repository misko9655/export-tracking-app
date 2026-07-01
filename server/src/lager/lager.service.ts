import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "path";

const VALID_SKLADISTA = ['002', '003', '802', '804', '903', '904'];

@Injectable()
export class LagerService {
    async findAll(skladisteId: string = '003') {
        if (process.env.USE_LOCAL_LAGER === 'true') {
            if (!VALID_SKLADISTA.includes(skladisteId)) {
                throw new NotFoundException(`Skladište ${skladisteId} nije dostupno`);
            }
            const filePath = join(process.cwd(), 'src', 'lager', 'mock-data', `${skladisteId}.json`);
            const raw = readFileSync(filePath, 'utf-8');
            return JSON.parse(raw);
        }
        const response = await fetch(`http://10.197.0.20/Magacin/Magacin/Lager/${skladisteId}`);
        if (!response.ok) {
            throw new InternalServerErrorException('ERP API nije dostupan');
        }
        return response.json();
    }
}
