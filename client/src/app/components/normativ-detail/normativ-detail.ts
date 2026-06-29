import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NormativService } from '../../services/normativ.service';
import { NormativTop } from '../../models/normativ.model';
import { NormativNodeComponent } from './normativ-node';

@Component({
    selector: 'app-normativ-detail',
    imports: [MatIconModule, MatButtonModule, NormativNodeComponent],
    templateUrl: './normativ-detail.html',
    styleUrl: './normativ-detail.scss',
})
export class NormativDetail {
    private normativService = inject(NormativService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    normativ = signal<NormativTop | null>(null);
    loading = signal(true);

    constructor() {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.load(id);
    }

    async load(id: string) {
        try {
            const data = await this.normativService.findById(id);
            this.normativ.set(data);
        } catch (e) {
            console.error('Greška pri učitavanju normativa:', e);
        } finally {
            this.loading.set(false);
        }
    }

    get nodes() {
        return this.normativ()?.tree?.[0]?.nodes ?? [];
    }

    goBack() {
        this.router.navigate(['normativi']);
    }
}
