import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ArtikalLogistika } from '../models/artikal-logistika.model';

@Injectable({ providedIn: 'root' })
export class ArtikliLogistikaService {
    http = inject(HttpClient);

    async findAll(): Promise<ArtikalLogistika[]> {
        return firstValueFrom(this.http.get<ArtikalLogistika[]>('/api/artikli-logistika'));
    }

    async update(artikalId: string, changes: Partial<ArtikalLogistika>): Promise<ArtikalLogistika> {
        return firstValueFrom(this.http.patch<ArtikalLogistika>(`/api/artikli-logistika/${artikalId}`, changes));
    }
}
