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

  allItems = signal<LagerItem[]>([]);
  searchQuery = signal('');
  selectedSkladiste = signal('003');

  skladista = ['002', '003', '802', '804', '903', '904'];

  displayedColumns = ['artikalId', 'artikalNaziv', 'skladisteId', 'kolicina', 'naruceno', 'rezervisano'];

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allItems();
    return this.allItems().filter(item =>
      item.artikalId.toLowerCase().includes(query)
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
    });
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
      const active = sort.active as keyof LagerItem;
      items.sort((a, b) => {
        const va = a[active];
        const vb = b[active];
        const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }
    if (!items.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lager', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
    });

    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Lager - Skladište ${this.selectedSkladiste()} - ${new Date().toLocaleDateString('sr-Latn')}`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF2C3E50' } };
    titleCell.alignment = { horizontal: 'center' };
    worksheet.getRow(1).height = 26;

    const headerRow = worksheet.addRow(['Šifra artikla', 'Naziv artikla', 'Skladište', 'Količina', 'Naručeno', 'Rezervisano']);
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    items.forEach((item, i) => {
      const dataRow = worksheet.addRow([
        item.artikalId, item.artikalNaziv, item.skladisteId, item.kolicina, item.naruceno, item.rezervisano
      ]);
      dataRow.eachCell((cell, colNumber) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.font = { size: 10, name: 'Calibri', color: { argb: 'FF000000' } };
        if (i % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        }
        if (colNumber === 4 || colNumber === 5 || colNumber === 6) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.000';
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        }
      });
    });

    worksheet.columns = [{ width: 14 }, { width: 38 }, { width: 12 }, { width: 14 }, { width: 14 }, { width: 14 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lager-${this.selectedSkladiste()}-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
