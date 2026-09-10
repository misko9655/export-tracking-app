import { Component, computed, effect, inject, signal, viewChild, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService } from '../../services/realtime.service';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PartneriService } from '../../services/partneri.service';
import { Partner } from '../../models/partner.model';
import { openAddPartnerDialog } from '../add-partner-dialog/add-partner-dialog';
import { openConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';

@Component({
    selector: 'app-partneri',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './partneri.html',
    styleUrl: './partneri.scss',
})
export class Partneri {
    private service = inject(PartneriService);
    private dialog = inject(MatDialog);
    private messagesService = inject(MessagesService);
    private realtimeService = inject(RealtimeService);
    private destroyRef = inject(DestroyRef);

    allItems = signal<Partner[]>([]);
    searchQuery = signal('');

    filteredItems = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.allItems();
        return this.allItems().filter(
            p => p.sifraPartnera.toLowerCase().includes(q) || p.nazivPartnera.toLowerCase().includes(q)
        );
    });

    displayedColumns = ['sifraPartnera', 'nazivPartnera', 'adresa', 'mesto', 'kategorija', 'actions'];

    sort = viewChild(MatSort);
    dataSource = new MatTableDataSource<Partner>();

    constructor() {
        this.load();

        this.realtimeService.onDataChanged('partner')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.load());

        effect(() => {
            this.dataSource.data = this.filteredItems();
        });

        effect(() => {
            this.dataSource.sort = this.sort() ?? null;
        });
    }

    private async load() {
        try {
            const items = await this.service.findAll();
            this.allItems.set(items);
        } catch (err) {
            console.error('Greška pri učitavanju partnera:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri učitavanju partnera. Pokušajte ponovo.', 'error');
            }
        }
    }

    async onAddPartner() {
        const created = await openAddPartnerDialog(this.dialog, { title: 'Dodaj partnera' });
        if (created) {
            this.allItems.update(items => [...items, created]);
        }
    }

    async onKategorijaChange(partner: Partner, kategorija: string) {
        try {
            const updated = await this.service.update(partner.sifraPartnera, { kategorija });
            this.allItems.update(items =>
                items.map(p => p.sifraPartnera === updated.sifraPartnera ? updated : p)
            );
        } catch (err) {
            console.error('Greška pri promeni kategorije:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri promeni kategorije. Pokušajte ponovo.', 'error');
            }
        }
    }

    async onDelete(partner: Partner) {
        const confirmation = await openConfirmationDialog(
            this.dialog,
            {
                message: `Da li ste sigurni da želite da obrišete partnera ${partner.sifraPartnera} - ${partner.nazivPartnera}? Ova akcija se ne može poništiti.`,
                title: 'Potvrdi brisanje',
            }
        );
        if (!confirmation) return;

        try {
            await this.service.delete(partner.sifraPartnera);
            this.allItems.update(items => items.filter(p => p.sifraPartnera !== partner.sifraPartnera));
            this.messagesService.showMessage('Partner je obrisan.', 'success');
        } catch (err) {
            console.error('Greška pri brisanju partnera:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri brisanju partnera. Pokušajte ponovo.', 'error');
            }
        }
    }
}
