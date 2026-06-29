import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NormativService } from '../../services/normativ.service';
import { NormativListItem, NormativNode } from '../../models/normativ.model';

@Component({
    selector: 'app-normativi',
    imports: [MatTableModule, MatInputModule, MatFormFieldModule, MatIconModule, MatSlideToggleModule, MatButtonModule, DecimalPipe, FormsModule],
    templateUrl: './normativi.html',
    styleUrl: './normativi.scss',
})
export class Normativi {
    private normativService = inject(NormativService);
    private router = inject(Router);

    allItems = signal<NormativListItem[]>([]);
    searchQuery = signal('');
    onlyActive = signal(false);
    displayedColumns = ['id', 'opis', 'jm', 'status'];

    gpItems = signal<NormativNode[] | null>(null);
    showGp = signal(false);
    gpColumns = ['artikalId', 'artikalNaziv', 'kolicina', 'kolicinaGP', 'kolicinaZaParentGP'];

    filteredItems = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        const activeOnly = this.onlyActive();
        return this.allItems().filter(n => {
            if (activeOnly && !n.isActive) return false;
            if (!q) return true;
            return n.id.toLowerCase().includes(q) || n.opis.toLowerCase().includes(q);
        });
    });

    constructor() {
        this.load();
    }

    async load() {
        try {
            const items = await this.normativService.findAll();
            this.allItems.set(items ?? []);
        } catch (e) {
            console.error('Greška pri učitavanju normativa:', e);
        }
    }

    openDetail(row: NormativListItem) {
        this.router.navigate(['normativi', row.id]);
    }

    async toggleGpView() {
        if (this.gpItems() === null) {
            try {
                const items = await this.normativService.findGpItems();
                this.gpItems.set(items ?? []);
            } catch (e) {
                console.error('Greška pri učitavanju GP artikala:', e);
                return;
            }
        }
        this.showGp.update(v => !v);
    }
}
