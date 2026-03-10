import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ProductionItem } from "../models/production-item.model";

@Injectable({
    providedIn: 'root'
})
export class ProductionService {
    http = inject(HttpClient);

    async loadAllItemsForProduction(): Promise<ProductionItem[]> {
        const productionItems$ = this.http.get<ProductionItem[]>(`/api/production-items`);
        return firstValueFrom(productionItems$);
    }
}