import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { QtyPipe } from '../../pipes/qty.pipe';
import { OrderItem } from '../../models/order-item.model';
import { LagerService } from '../../services/lager.service';
import { ExcelExportService } from '../../services/excel-export.service';

export type CheckAvailabilityData = {
  orderItems: OrderItem[];
};

type AvailabilityRow = {
  productCode: string;
  productName: string;
  jm: string;
  remainingTp: number;
  availableTp: number;
  ok: boolean;
};

@Component({
  selector: 'app-check-availability-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, QtyPipe],
  templateUrl: './check-availability-dialog.html',
  styleUrl: './check-availability-dialog.scss',
})
export class CheckAvailabilityDialog {
  data = inject<CheckAvailabilityData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<CheckAvailabilityDialog>);
  lagerService = inject(LagerService);
  private excelExportService = inject(ExcelExportService);

  displayedColumns = ['productCode', 'productName', 'jm', 'remainingTp', 'availableTp', 'status'];

  rows = signal<AvailabilityRow[]>([]);
  loading = signal(true);

  constructor() {
    this.load();
  }

  private async load() {
    const pending = this.data.orderItems.filter(
      item => item.numberOfOrderedTp > (item.numberOfReadyTp ?? 0)
    );

    if (pending.length === 0) {
      this.loading.set(false);
      return;
    }

    try {
      const lagerItems = await this.lagerService.findAll('003');
      const lagerMap = new Map(lagerItems.map(l => [l.artikalId, l]));

      this.rows.set(pending.map(item => {
        const remainingTp = item.numberOfOrderedTp - (item.numberOfReadyTp ?? 0);
        const lagerEntry = lagerMap.get(item.productCode);
        const unitsPerBox = item.unitsInTransportBox || 1;
        const raspolozivo = lagerEntry ? lagerEntry.kolicina - lagerEntry.rezervisano : 0;
        const availableTp = raspolozivo / unitsPerBox;
        return {
          productCode: item.productCode,
          productName: item.productName,
          jm: item.jm,
          remainingTp,
          availableTp,
          ok: availableTp >= remainingTp,
        };
      }));
    } finally {
      this.loading.set(false);
    }
  }

  async exportToExcel(): Promise<void> {
    const coveredRows = this.rows().filter(r => r.remainingTp < r.availableTp);
    if (coveredRows.length === 0) return;

    // Dinamički import - exceljs se ne učitava dok korisnik ne klikne export
    const ExcelJS = (await import('exceljs')).default;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pokriveni artikli', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
    });

    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Pokriveni artikli - ${new Date().toLocaleDateString('sr-Latn')}`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF2C3E50' } };
    titleCell.alignment = { horizontal: 'center' };
    worksheet.getRow(1).height = 26;

    const headerRow = worksheet.addRow(['Šifra artikla', 'Naziv artikla', 'Potrebno TP', 'Raspoloživo TP']);

    headerRow.eachCell(cell => this.excelExportService.styleHeaderCell(cell));

    coveredRows.forEach((row, i) => {
      const dataRow = worksheet.addRow([row.productCode, row.productName, row.remainingTp, row.availableTp]);
      dataRow.eachCell((cell, colNumber) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.font = { size: 10, name: 'Calibri', color: { argb: 'FF000000' } };
        if (i % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        }
        if (colNumber === 3 || colNumber === 4) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00';
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        }
      });
    });

    worksheet.columns = [{ width: 14 }, { width: 38 }, { width: 16 }, { width: 16 }];

    await this.excelExportService.downloadWorkbook(
      workbook,
      `provera-raspolozivosti-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  }
}

export async function openCheckAvailabilityDialog(dialog: MatDialog, data: CheckAvailabilityData) {
  const config = new MatDialogConfig<CheckAvailabilityData>();
  config.width = '95vw';
  config.maxWidth = '1100px';
  config.maxHeight = '85vh';
  config.data = data;

  const close$ = dialog.open(CheckAvailabilityDialog, config).afterClosed();
  return firstValueFrom(close$);
}
