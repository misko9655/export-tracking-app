import { Component, computed, effect, inject, signal, viewChild, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RealtimeService } from '../../services/realtime.service';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { RepromaterijaliService } from '../../services/repromaterijali.service';
import { Repromaterijal } from '../../models/repromaterijal.model';
import { openEditRepromaterijalDialog } from '../edit-repromaterijal-dialog/edit-repromaterijal-dialog';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';

type TipFilter = 'sve' | 'sirovina' | 'ambalaza';

@Component({
    selector: 'app-repromaterijali',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatButtonToggleModule,
    ],
    templateUrl: './repromaterijali.html',
    styleUrl: './repromaterijali.scss',
})
export class Repromaterijali {
    private service = inject(RepromaterijaliService);
    private dialog = inject(MatDialog);
    private messagesService = inject(MessagesService);
    private realtimeService = inject(RealtimeService);
    private destroyRef = inject(DestroyRef);

    allItems = signal<Repromaterijal[]>([]);
    searchQuery = signal('');
    tipFilter = signal<TipFilter>('sve');
    refreshing = signal(false);

    tipLabels: Record<string, string> = {
        sirovina: 'Sirovina',
        ambalaza: 'Ambalaža',
    };

    filteredItems = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        const tip = this.tipFilter();
        const base = tip === 'sve' ? this.allItems() : this.allItems().filter(r => r.tipRepromaterijala === tip);
        if (!q) return base;
        return base.filter(
            r => r.sifraRepromaterijala.toLowerCase().includes(q) || r.nazivRepromaterijala.toLowerCase().includes(q)
        );
    });

    displayedColumns = ['sifraRepromaterijala', 'nazivRepromaterijala', 'jedinicaMere', 'tipRepromaterijala', 'actions'];

    sort = viewChild(MatSort);
    dataSource = new MatTableDataSource<Repromaterijal>();

    constructor() {
        this.load();

        this.realtimeService.onDataChanged('repromaterijal')
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
            console.error('Greška pri učitavanju repromaterijala:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri učitavanju repromaterijala. Pokušajte ponovo.', 'error');
            }
        }
    }

    setTipFilter(tip: TipFilter) {
        this.tipFilter.set(tip);
    }

    async openEdit(repromaterijal: Repromaterijal) {
        const updated = await openEditRepromaterijalDialog(this.dialog, repromaterijal);
        if (updated) {
            this.allItems.update(items =>
                items.map(r => r.sifraRepromaterijala === updated.sifraRepromaterijala ? updated : r)
            );
        }
    }

    async onRefreshFromErp() {
        this.refreshing.set(true);
        try {
            const result = await this.service.refreshFromErp();
            await this.load();
            this.messagesService.showMessage(
                `Osveženo sa ERP-a: ${result.created} novih, ${result.matched} postojećih.`,
                'success'
            );
        } catch (err) {
            console.error('Greška pri osvežavanju sa ERP-a:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri osvežavanju sa ERP-a. Pokušajte ponovo.', 'error');
            }
        } finally {
            this.refreshing.set(false);
        }
    }
}
