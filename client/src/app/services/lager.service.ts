import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { LagerItem } from "../models/lager-item.model";
import { MessagesService } from "./messages.service";

export type CustomsStockResult = {
    map: Map<string, number>;
    unavailableWarehouses: string[];
};

@Injectable({
    providedIn: 'root',
})
export class LagerService {
    http = inject(HttpClient);
    private messagesService = inject(MessagesService);

    async findAll(skladisteId: string = '003'): Promise<LagerItem[]> {
        const response = await firstValueFrom(
            this.http.get<LagerItem[]>(`/api/lager/${skladisteId}`, { observe: 'response' })
        ) as HttpResponse<LagerItem[]>;

        if (response.headers.get('X-Data-Source') === 'fallback') {
            this.messagesService.showMessage(
                `Magacin ${skladisteId}: ERP (eksterni sistem) trenutno nije dostupan — prikazani su rezervni (keširani) podaci.`,
                'warning'
            );
        }

        return response.body ?? [];
    }

    async getCustomsStock(): Promise<CustomsStockResult> {
        const warehouses = ['802', '804'];
        const results = await Promise.allSettled(warehouses.map(w => this.findAll(w)));

        const map = new Map<string, number>();
        const unavailableWarehouses: string[] = [];

        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                for (const item of result.value) {
                    map.set(item.artikalId, (map.get(item.artikalId) ?? 0) + item.kolicina);
                }
            } else {
                unavailableWarehouses.push(warehouses[i]);
            }
        });

        return { map, unavailableWarehouses };
    }
}
