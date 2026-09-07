import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Repromaterijal } from '../models/repromaterijal.model';

@Injectable({
    providedIn: 'root',
})
export class RepromaterijaliService {
    http = inject(HttpClient);

    async findAll(): Promise<Repromaterijal[]> {
        return firstValueFrom(this.http.get<Repromaterijal[]>('/api/repromaterijali'));
    }

    async update(sifraRepromaterijala: string, changes: Partial<Repromaterijal>): Promise<Repromaterijal> {
        return firstValueFrom(this.http.patch<Repromaterijal>(`/api/repromaterijali/${sifraRepromaterijala}`, changes));
    }

    async refreshFromErp(): Promise<{ created: number; matched: number }> {
        return firstValueFrom(this.http.post<{ created: number; matched: number }>('/api/repromaterijali/refresh', {}));
    }
}
