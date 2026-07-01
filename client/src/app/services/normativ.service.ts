import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { NormativListItem, NormativNode, NormativTop } from "../models/normativ.model";

@Injectable({
    providedIn: 'root',
})
export class NormativService {
    private http = inject(HttpClient);

    findAll(): Promise<NormativListItem[]> {
        return firstValueFrom(this.http.get<NormativListItem[]>('/api/normativ-tree'));
    }

    findById(id: string): Promise<NormativTop> {
        return firstValueFrom(this.http.get<NormativTop>(`/api/normativ-tree/${id}`));
    }

    findGpItems(): Promise<NormativNode[]> {
        return firstValueFrom(this.http.get<NormativNode[]>('/api/normativ-tree/gp-items'));
    }
}
