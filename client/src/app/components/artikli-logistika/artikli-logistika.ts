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
import { ExcelExportService } from '../../services/excel-export.service';

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
    private excelExportService = inject(ExcelExportService);
    private dialog = inject(MatDialog);
    private messagesService = inject(MessagesService);
    private realtimeService = inject(RealtimeService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    allItems = signal<ArtikalLogistika[]>([]);
    searchQuery = signal('');
    // Podrazumevano prikazuje samo artikle SA normativom (proizvedeni artikli);
    // trgovačka roba (bez normativa) je sakrivena dok se dugme ne aktivira.
    showTradeGoods = signal(false);
    role = computed(() => this.authService.effectiveRole());
    sort = viewChild(MatSort);

    filteredItems = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        const base = this.showTradeGoods()
            ? this.allItems().filter(a => !a.normativCode)
            : this.allItems().filter(a => !!a.normativCode);
        if (!q) return base;
        return base.filter(
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

    toggleTradeGoods() {
        this.showTradeGoods.update(v => !v);
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

    // Redosled mora tačno da prati kolone 3-14 u exportToExcel() (Kom/TP, Paketa/pal.,
    // pa dimenzije/težine OJ i TP) - fajl za uvoz je namerno istog formata kao export.
    private static readonly LOGISTIKA_FIELDS = [
        'artikalJmUTp', 'paketaNapaleti',
        'visinaJed', 'sirinaJed', 'dubinaJed', 'nettoTezinaJed', 'bruttoTezinaJed',
        'visinaTP', 'sirinaTP', 'dubinaTP', 'nettoTezinaTP', 'bruttoTezinaTP',
    ] as const;

    async onImportFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        try {
            // Dinamički import - exceljs se ne učitava dok korisnik ne izabere fajl
            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await file.arrayBuffer());
            const worksheet = workbook.worksheets[0];
            if (!worksheet) {
                this.messagesService.showMessage('Excel fajl nema sheet-ova.', 'error');
                return;
            }

            const byId = new Map(this.allItems().map(a => [a.artikalId, a]));
            const updates: (Partial<ArtikalLogistika> & { artikalId: string })[] = [];
            let notFound = 0;

            // Red 1 = naslov (spojene ćelije), red 2 = header, podaci od reda 3 -
            // tačno odgovara strukturi koju exportToExcel() generiše.
            for (let i = 3; i <= worksheet.rowCount; i++) {
                const row = worksheet.getRow(i);
                const artikalId = row.getCell(1).value?.toString()?.trim() || '';
                if (!artikalId) continue;

                const current = byId.get(artikalId);
                if (!current) {
                    notFound++;
                    continue;
                }

                const changes: Record<string, number> = {};
                ArtikliLogistika.LOGISTIKA_FIELDS.forEach((field, idx) => {
                    const importedValue = this.extractNumber(row.getCell(3 + idx).value);
                    const currentValue = (current as any)[field] ?? 0;
                    if (Math.abs(importedValue - currentValue) > 1e-6) {
                        changes[field] = importedValue;
                    }
                });

                if (Object.keys(changes).length > 0) {
                    updates.push({ artikalId, ...changes });
                }
            }

            if (updates.length === 0) {
                this.messagesService.showMessage(
                    notFound > 0
                        ? `Nema izmena za uvoz. ${notFound} šifri iz fajla nije pronađeno u bazi.`
                        : 'Nema izmena za uvoz - svi podaci u fajlu se poklapaju sa bazom.',
                    'info'
                );
                return;
            }

            const result = await this.service.bulkUpdate(updates);
            await this.load();
            this.messagesService.showMessage(
                `Ažurirano ${result.updated} artikala.` + (notFound > 0 ? ` ${notFound} šifri nije pronađeno u bazi.` : ''),
                'success'
            );
        } catch (err) {
            console.error('Greška pri uvozu:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri uvozu fajla. Proverite da li je format isti kao kod izvoza.', 'error');
            }
        } finally {
            input.value = '';
        }
    }

    private extractNumber(value: any): number {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const cleaned = value.trim().replace(/[^\d,.-]/g, '').replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? 0 : parsed;
        }
        if (typeof value === 'object') {
            if ('result' in value) return this.extractNumber(value.result);
            if ('text' in value) return this.extractNumber(value.text);
        }
        return 0;
    }

    async exportToExcel(): Promise<void> {
        const items = [...this.filteredItems()];
        const sort = this.sort();
        if (sort?.active && sort.direction) {
            const active = sort.active;
            items.sort((a, b) => {
                const va = (a as any)[active];
                const vb = (b as any)[active];
                const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
                return sort.direction === 'asc' ? cmp : -cmp;
            });
        }
        if (!items.length) return;

        // Dinamički import - exceljs se ne učitava dok korisnik ne klikne export
        const ExcelJS = (await import('exceljs')).default;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Artikli - logistika', {
            pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
        });

        worksheet.mergeCells('A1:N1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `Artikli - logistika${this.showTradeGoods() ? ' (trgovačka roba)' : ''} - ${new Date().toLocaleDateString('sr-Latn')}`;
        titleCell.font = { bold: true, size: 14, color: { argb: 'FF2C3E50' } };
        titleCell.alignment = { horizontal: 'center' };
        worksheet.getRow(1).height = 26;

        // Svaka dimenzija/težina u sopstvenoj koloni (ne spojene kao na ekranu) da bi
        // fajl mogao kasnije da posluži kao šablon za uvoz logističkih podataka.
        const headers = [
            'Šifra artikla', 'Naziv artikla', 'Kom/TP', 'Paketa/pal.',
            'Visina OJ (m)', 'Širina OJ (m)', 'Dubina OJ (m)', 'Neto težina OJ (kg)', 'Bruto težina OJ (kg)',
            'Visina TP (m)', 'Širina TP (m)', 'Dubina TP (m)', 'Neto težina TP (kg)', 'Bruto težina TP (kg)',
        ];
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell(cell => this.excelExportService.styleHeaderCell(cell));

        items.forEach((item, i) => {
            const rowValues = [
                item.artikalId,
                item.artikalNaziv,
                item.artikalJmUTp,
                item.paketaNapaleti,
                item.visinaJed,
                item.sirinaJed,
                item.dubinaJed,
                item.nettoTezinaJed,
                item.bruttoTezinaJed,
                item.visinaTP,
                item.sirinaTP,
                item.dubinaTP,
                item.nettoTezinaTP,
                item.bruttoTezinaTP,
            ];
            const dataRow = worksheet.addRow(rowValues);
            dataRow.eachCell((cell, colNumber) => {
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                cell.font = { size: 10, name: 'Calibri', color: { argb: 'FF000000' } };
                if (i % 2 === 1) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
                }
                if (colNumber >= 3) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = colNumber <= 4 ? '#,##0' : '0.###';
                } else {
                    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                }
            });
        });

        worksheet.columns = [
            { width: 14 }, { width: 38 }, { width: 10 }, { width: 12 },
            { width: 13 }, { width: 13 }, { width: 13 }, { width: 16 }, { width: 16 },
            { width: 13 }, { width: 13 }, { width: 13 }, { width: 16 }, { width: 16 },
        ];

        await this.excelExportService.downloadWorkbook(
            workbook,
            `artikli-logistika-${new Date().toISOString().split('T')[0]}.xlsx`
        );
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
