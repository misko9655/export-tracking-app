import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProductionService {
    http = inject(HttpClient);

    async loadAllItemsForProduction() {
        const productionItems$ = this.http.get(`/api/order-items`);
        return firstValueFrom(productionItems$);
    }
}