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
}
