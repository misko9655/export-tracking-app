import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService } from '../../services/realtime.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ArtikliLogistikaService } from '../../services/artikli-logistika.service';
import { ArtikalLogistika } from '../../models/artikal-logistika.model';
import { openEditArtikalLogistikaDialog } from '../edit-artikal-logistika-dialog/edit-artikal-logistika-dialog';
import { MessagesService } from '../../services/messages.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-artikli-logistika',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './artikli-logistika.html',
    styleUrl: './artikli-logistika.scss',
})
export class ArtikliLogistika {
    private service = inject(ArtikliLogistikaService);
    private dialog = inject(MatDialog);
    private messagesService = inject(MessagesService);
    private realtimeService = inject(RealtimeService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    allItems = signal<ArtikalLogistika[]>([]);
    searchQuery = signal('');
    role = computed(() => this.authService.user()?.roles[0] ?? null);

    filteredItems = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.allItems();
        return this.allItems().filter(
            a => a.artikalId.toLowerCase().includes(q) || a.artikalNaziv.toLowerCase().includes(q)
        );
    });

    displayedColumns = [
        'artikalId', 'artikalNaziv', 'artikalJmUTp',
        'paketaNapaleti',
        'dimJed', 'tezJed',
        'dimTP', 'tezTP',
        'actions',
    ];

    constructor() {
        this.load();

        this.realtimeService.onDataChanged('artikal-logistika')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.load());
    }

    private async load() {
        try {
            const items = await this.service.findAll();
            this.allItems.set(items);
        } catch (err) {
            console.error('Greška pri učitavanju artikala:', err);
            this.messagesService.showMessage('Greška pri učitavanju artikala. Pokušajte ponovo.', 'error');
        }
    }

    async openEdit(artikal: ArtikalLogistika) {
        const updated = await openEditArtikalLogistikaDialog(this.dialog, artikal);
        if (updated) {
            this.allItems.update(items =>
                items.map(a => a.artikalId === updated.artikalId ? updated : a)
            );
        }
    }

    fmt(val: number): string {
        return val ? val.toString() : '–';
    }
}
