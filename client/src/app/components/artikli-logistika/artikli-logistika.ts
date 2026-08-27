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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { ArtikliLogistikaService } from '../../services/artikli-logistika.service';
import { ArtikalLogistika } from '../../models/artikal-logistika.model';
import { openEditArtikalLogistikaDialog } from '../edit-artikal-logistika-dialog/edit-artikal-logistika-dialog';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';
import { AuthService } from '../../services/auth.service';
import { OrderItemsService } from '../../services/order-items.service';
import { openConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';

@Component({
    selector: 'app-artikli-logistika',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
    ],
    templateUrl: './artikli-logistika.html',
    styleUrl: './artikli-logistika.scss',
})
export class ArtikliLogistika {
    private service = inject(ArtikliLogistikaService);
    private orderItemsService = inject(OrderItemsService);
    private dialog = inject(MatDialog);
    private messagesService = inject(MessagesService);
    private realtimeService = inject(RealtimeService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    allItems = signal<ArtikalLogistika[]>([]);
    searchQuery = signal('');
    role = computed(() => this.authService.effectiveRole());
    sort = viewChild(MatSort);

    filteredItems = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.allItems();
        return this.allItems().filter(
            a => a.artikalId.toLowerCase().includes(q) || a.artikalNaziv.toLowerCase().includes(q)
        );
    });

    private static readonly BASE_COLUMNS = [
        'artikalId', 'artikalNaziv', 'artikalJmUTp',
        'paketaNapaleti',
        'dimJed', 'tezJed',
        'dimTP', 'tezTP',
        'actions',
    ];

    displayedColumns = computed(() =>
        this.role() === 'ADMIN' ? ['select', ...ArtikliLogistika.BASE_COLUMNS] : ArtikliLogistika.BASE_COLUMNS
    );

    selection = new SelectionModel<string>(true, []);

    dataSource = new MatTableDataSource<ArtikalLogistika>();

    constructor() {
        this.load();

        this.realtimeService.onDataChanged('artikal-logistika')
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
            console.error('Greška pri učitavanju artikala:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri učitavanju artikala. Pokušajte ponovo.', 'error');
            }
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

    async onDelete(artikal: ArtikalLogistika) {
        const confirmation = await openConfirmationDialog(
            this.dialog,
            {
                message: `Da li ste sigurni da želite da obrišete artikal ${artikal.artikalId} - ${artikal.artikalNaziv}?`,
                title: 'Potvrdi brisanje',
            }
        );
        if (!confirmation) return;

        try {
            await this.service.delete(artikal.artikalId);
            this.allItems.update(items => items.filter(a => a.artikalId !== artikal.artikalId));
            this.messagesService.showMessage('Artikal je obrisan.', 'success');
        } catch (err) {
            console.error('Greška pri brisanju artikla:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri brisanju artikla. Pokušajte ponovo.', 'error');
            }
        }
    }

    isAllSelected(): boolean {
        const visible = this.filteredItems();
        return visible.length > 0 && visible.every(a => this.selection.isSelected(a.artikalId));
    }

    masterToggle() {
        const visible = this.filteredItems();
        if (this.isAllSelected()) {
            visible.forEach(a => this.selection.deselect(a.artikalId));
        } else {
            visible.forEach(a => this.selection.select(a.artikalId));
        }
    }

    async onBulkDelete() {
        const ids = this.selection.selected;
        const confirmation = await openConfirmationDialog(
            this.dialog,
            {
                message: `Da li ste sigurni da želite da obrišete ${ids.length} artikala?`,
                title: 'Potvrdi brisanje',
            }
        );
        if (!confirmation) return;

        try {
            const result = await this.service.deleteMany(ids);
            this.allItems.update(items => items.filter(a => !ids.includes(a.artikalId)));
            this.selection.clear();
            this.messagesService.showMessage(`Obrisano ${result.deleted} artikala.`, 'success');
        } catch (err) {
            console.error('Greška pri grupnom brisanju artikala:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri brisanju artikala. Pokušajte ponovo.', 'error');
            }
        }
    }

    fmt(val: number): string {
        return val ? val.toString() : '–';
    }

    async onUpdateLogistics() {
        const confirmation = await openConfirmationDialog(
            this.dialog,
            {
                message: 'Da li ste sigurni da želite da ažurirate logistiku za sve artikle na svim trebovanjima?',
                title: 'Potvrdi akciju'
            }
        );
        if (!confirmation) return;

        try {
            const result = await this.orderItemsService.updateLogistics();
            this.messagesService.showMessage(`Ažurirano ${result.updated} od ${result.total} stavki.`, 'success');
        } catch (err) {
            console.error('Greška pri ažuriranju logistike:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri ažuriranju logistike. Pokušajte ponovo.', 'error');
            }
        }
    }
}
