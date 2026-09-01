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

    async delete(artikalId: string): Promise<void> {
        await firstValueFrom(this.http.delete(`/api/artikli-logistika/${artikalId}`));
    }

    async deleteMany(artikalIds: string[]): Promise<{ deleted: number }> {
        return firstValueFrom(this.http.post<{ deleted: number }>('/api/artikli-logistika/bulk-delete', { artikalIds }));
    }

    async bulkUpdate(updates: (Partial<ArtikalLogistika> & { artikalId: string })[]): Promise<{ updated: number }> {
        return firstValueFrom(this.http.post<{ updated: number }>('/api/artikli-logistika/bulk-update', { updates }));
    }
}
