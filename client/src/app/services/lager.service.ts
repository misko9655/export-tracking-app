import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { LagerItem } from "../models/lager-item.model";

@Injectable({
    providedIn: 'root',
})
export class LagerService {
    http = inject(HttpClient);

    async findAll(skladisteId: string = '003'): Promise<LagerItem[]> {
        return firstValueFrom(this.http.get<LagerItem[]>(`/api/lager/${skladisteId}`));
    }

    async getCustomsStock(): Promise<Map<string, number>> {
        const [w802, w804] = await Promise.all([this.findAll('802'), this.findAll('804')]);
        const map = new Map<string, number>();
        for (const item of [...w802, ...w804]) {
            map.set(item.artikalId, (map.get(item.artikalId) ?? 0) + item.kolicina);
        }
        return map;
    }
}
