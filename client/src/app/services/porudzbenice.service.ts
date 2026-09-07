import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Porudzbenica } from '../models/porudzbenica.model';

@Injectable({
    providedIn: 'root',
})
export class PorudzbeniceService {
    http = inject(HttpClient);

    async findAll(): Promise<Porudzbenica[]> {
        return firstValueFrom(this.http.get<Porudzbenica[]>('/api/porudzbenice'));
    }

    async findOne(id: string): Promise<Porudzbenica> {
        return firstValueFrom(this.http.get<Porudzbenica>(`/api/porudzbenice/${id}`));
    }

    async create(porudzbenica: Partial<Porudzbenica>): Promise<Porudzbenica> {
        return firstValueFrom(this.http.post<Porudzbenica>('/api/porudzbenice', porudzbenica));
    }

    async addStavka(id: string, stavka: { artikalId: string; artikalNaziv: string; artikalJm: string; kolicina: number }): Promise<Porudzbenica> {
        return firstValueFrom(this.http.post<Porudzbenica>(`/api/porudzbenice/${id}/stavke`, stavka));
    }

    async removeStavka(id: string, stavkaId: string): Promise<Porudzbenica> {
        return firstValueFrom(this.http.delete<Porudzbenica>(`/api/porudzbenice/${id}/stavke/${stavkaId}`));
    }

    async updateStatus(id: string, status: Porudzbenica['status']): Promise<Porudzbenica> {
        return firstValueFrom(this.http.patch<Porudzbenica>(`/api/porudzbenice/${id}/status`, { status }));
    }
}
