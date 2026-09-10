import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Partner } from '../models/partner.model';

@Injectable({
    providedIn: 'root',
})
export class PartneriService {
    http = inject(HttpClient);

    async findAll(): Promise<Partner[]> {
        return firstValueFrom(this.http.get<Partner[]>('/api/partneri'));
    }

    async create(partner: Partial<Partner>): Promise<Partner> {
        return firstValueFrom(this.http.post<Partner>('/api/partneri', partner));
    }

    async update(sifraPartnera: string, changes: Partial<Partner>): Promise<Partner> {
        return firstValueFrom(this.http.patch<Partner>(`/api/partneri/${sifraPartnera}`, changes));
    }

    async delete(sifraPartnera: string): Promise<void> {
        await firstValueFrom(this.http.delete(`/api/partneri/${sifraPartnera}`));
    }
}
