import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import * as ExcelJS from 'exceljs';
import { LagerService } from '../../services/lager.service';
import { LagerItem } from '../../models/lager-item.model';
import { MessagesService } from '../../services/messages.service';
import { ExcelExportService } from '../../services/excel-export.service';

@Component({
  selector: 'app-lager',
  imports: [
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    DecimalPipe,
  ],
  templateUrl: './lager.html',
  styleUrl: './lager.scss',
})
export class Lager {
  private lagerService = inject(LagerService);
  private messagesService = inject(MessagesService);
  private excelExportService = inject(ExcelExportService);

  allItems = signal<LagerItem[]>([]);
  searchQuery = signal('');
  selectedSkladiste = signal('003');

  skladista = ['001', '002', '003', '004', '202', '802', '804', '903', '904'];
  private static readonly RASPOLOZIVA_SKLADISTA = ['003', '903', '904'];

  displayedColumns = computed(() => {
    const base = ['artikalId', 'artikalNaziv', 'artikalJm', 'kolicina', 'naruceno', 'rezervisano'];
    return Lager.RASPOLOZIVA_SKLADISTA.includes(this.selectedSkladiste())
      ? [...base, 'raspoloziva', 'raspolozivaTp']
      : base;
  });

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allItems();
    return this.allItems().filter(item =>
      item.artikalId.toLowerCase().includes(query) ||
      item.artikalNaziv.toLowerCase().includes(query)
    );
  });

  negativeCount = computed(() =>
    this.allItems().filter(i => i.kolicina < 0).length
  );

  dataSource = new MatTableDataSource<LagerItem>();
  sort = viewChild(MatSort);

  constructor() {
    this.loadLager('003');

    effect(() => {
      this.dataSource.data = this.filteredItems();
    });

    effect(() => {
      this.dataSource.sort = this.sort() ?? null;
      if (this.dataSource.sort) {
        this.dataSource.sortingDataAccessor = (item, columnId) => {
          if (columnId === 'raspoloziva') return this.raspoloziva(item);
          if (columnId === 'raspolozivaTp') return this.raspolozivaTp(item);
          return (item as any)[columnId];
        };
      }
    });
  }

  raspoloziva(item: LagerItem): number {
    return item.kolicina - item.rezervisano;
  }

  raspolozivaTp(item: LagerItem): number {
    if (!item.artikalJmUTp) return 0;
    return this.raspoloziva(item) / item.artikalJmUTp;
  }

  async onSkladisteChange(skladisteId: string) {
    this.selectedSkladiste.set(skladisteId);
    await this.loadLager(skladisteId);
  }

  async loadLager(skladisteId: string) {
    try {
      const items = await this.lagerService.findAll(skladisteId);
      this.allItems.set(items ?? []);
    } catch (error) {
      console.error('Greška pri učitavanju lagera:', error);
      this.messagesService.showMessage('Greška pri učitavanju lagera. Pokušajte ponovo.', 'error');
      this.allItems.set([]);
    }
  }

  async exportToExcel(): Promise<void> {
    let items = [...this.filteredItems()];
    const sort = this.sort();
    if (sort?.active && sort.direction) {
      const active = sort.active;
      const resolve = (item: LagerItem) => {
        if (active === 'raspoloziva') return this.raspoloziva(item);
        if (active === 'raspolozivaTp') return this.raspolozivaTp(item);
        return (item as any)[active];
      };
      items.sort((a, b) => {
        const va = resolve(a);
        const vb = resolve(b);
        const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }
    if (!items.length) return;

    const showRaspoloziva = Lager.RASPOLOZIVA_SKLADISTA.includes(this.selectedSkladiste());
    const lastCol = showRaspoloziva ? 'H' : 'F';

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lager', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
    });

    worksheet.mergeCells(`A1:${lastCol}1`);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Lager - Skladište ${this.selectedSkladiste()} - ${new Date().toLocaleDateString('sr-Latn')}`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF2C3E50' } };
    titleCell.alignment = { horizontal: 'center' };
    worksheet.getRow(1).height = 26;

    const headers = ['Šifra artikla', 'Naziv artikla', 'Jed. mere', 'Količina', 'Naručeno', 'Rezervisano'];
    if (showRaspoloziva) headers.push('Raspoloživa količina', 'Raspoloživa količina TP');
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell(cell => this.excelExportService.styleHeaderCell(cell));

    items.forEach((item, i) => {
      const rowValues: (string | number)[] = [
        item.artikalId, item.artikalNaziv, item.artikalJm, item.kolicina, item.naruceno, item.rezervisano
      ];
      if (showRaspoloziva) rowValues.push(this.raspoloziva(item), this.raspolozivaTp(item));
      const dataRow = worksheet.addRow(rowValues);
      dataRow.eachCell((cell, colNumber) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.font = { size: 10, name: 'Calibri', color: { argb: 'FF000000' } };
        if (i % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        }
        if (colNumber === 4 || colNumber === 5 || colNumber === 6 || colNumber === 7 || colNumber === 8) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.000';
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        }
      });
    });

    const columnWidths = [{ width: 14 }, { width: 38 }, { width: 12 }, { width: 14 }, { width: 14 }, { width: 14 }];
    if (showRaspoloziva) columnWidths.push({ width: 16 }, { width: 18 });
    worksheet.columns = columnWidths;

    await this.excelExportService.downloadWorkbook(
      workbook,
      `lager-${this.selectedSkladiste()}-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  }
}
