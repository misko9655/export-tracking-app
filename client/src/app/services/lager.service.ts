import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { LagerItem } from "../models/lager-item.model";
import { MessagesService } from "./messages.service";

export type CustomsStockResult = {
    map: Map<string, number>;
    unavailableWarehouses: string[];
};

type CacheEntry = { promise: Promise<LagerItem[]>; expiresAt: number };

@Injectable({
    providedIn: 'root',
})
export class LagerService {
    http = inject(HttpClient);
    private messagesService = inject(MessagesService);

    // Lager podaci dolaze iz ERP-a bez ikakvog realtime obaveštenja o promeni
    // (za razliku od Customers/Orders), pa se keširaju samo kratko - dovoljno
    // da se izbegnu skoro istovremeni dupli pozivi za isto skladište (npr. dve
    // komponente na istoj strani), a da stanje zaliha ne ostane zastarelo.
    private static readonly CACHE_TTL_MS = 60_000;
    private cache = new Map<string, CacheEntry>();

    async findAll(skladisteId: string = '003'): Promise<LagerItem[]> {
        const cached = this.cache.get(skladisteId);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.promise;
        }
        const promise = this.fetchAll(skladisteId).catch(err => {
            this.cache.delete(skladisteId);
            throw err;
        });
        this.cache.set(skladisteId, { promise, expiresAt: Date.now() + LagerService.CACHE_TTL_MS });
        return promise;
    }

    invalidate(skladisteId?: string) {
        if (skladisteId) {
            this.cache.delete(skladisteId);
        } else {
            this.cache.clear();
        }
    }

    private async fetchAll(skladisteId: string): Promise<LagerItem[]> {
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
