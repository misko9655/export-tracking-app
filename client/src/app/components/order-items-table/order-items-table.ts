import { Component, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { OrderItem } from '../../models/order-item.model';
import { LagerService } from '../../services/lager.service';
import { LagerItem } from '../../models/lager-item.model';
import { MatDialog } from '@angular/material/dialog';
import { openEditOrderItemDialog } from '../edit-order-item-dialog/edit-order-item-dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { openConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Order } from '../../models/order.model';
import { Customer } from '../../models/customer.model';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ExcelExportService } from '../../services/excel-export.service';

@Component({
  selector: 'app-order-items-table',
  imports: [
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    DatePipe,
    DecimalPipe,
    MatFormField,
    MatInputModule,
    MatSlideToggleModule
  ],
  providers: [],
  templateUrl: './order-items-table.html',
  styleUrl: './order-items-table.scss',
})
export class OrderItemsTable {
  orderItems = input.required<OrderItem[]>();
  order = input<Order>();
  orderItemUpdated = output<OrderItem>();
  orderItemDeleted = output<string>();
  role = input.required<string | null>();

  dialogForConfirmation = inject(MatDialog);

  dialog = inject(MatDialog);
  private excelExportService = inject(ExcelExportService);
  private lagerService = inject(LagerService);

  private static readonly STANDARD_COLUMNS = [
    'productCode', 'productName', 'unitsInTransportBox', 'orderedQuantityTp',
    'readyQuantity', 'remainingTp', 'numberOfPallets', 'readyPallets', 'lot', 'dateOfExpire', 'actions'
  ];
  private static readonly DOMESTIC_COLUMNS = [
    'productCode', 'productName', 'unitsInTransportBox', 'orderedQuantityTp', 'raspolozivoTp', 'actions'
  ];

  // Odvojeno kao boolean signal da bi Angular signals shortcut (Object.is) sprečio
  // nepotrebno ponovno računanje displayedColumns kad se order() referenca promeni
  // (npr. usled realtime refresh-a) a domesticMarket vrednost ostane ista.
  private isDomesticMarket = computed(() => !!this.order()?.domesticMarket);

  displayedColumns = computed(() =>
    this.isDomesticMarket() ? OrderItemsTable.DOMESTIC_COLUMNS : OrderItemsTable.STANDARD_COLUMNS
  );
  dataSource = new MatTableDataSource<OrderItem>();
  trackBy = (index: number, el: OrderItem) => el.id;
  sort = viewChild(MatSort);
  showOnlyUnavailable = signal(false);
  searchText = signal('');
  lagerMap = signal<Map<string, LagerItem>>(new Map());
  private lagerLoaded = false;

  constructor() {
    effect(() => {
      const items = this.orderItems();
      if (!this.orderItemsEqual(this.dataSource.data, items)) {
        this.dataSource.data = items;
      }
      this.dataSource.filterPredicate = this.customFilterPredicate();
    })

    effect(() => {
      if (!this.order()?.domesticMarket || this.lagerLoaded) return;
      this.lagerLoaded = true;
      this.lagerService.findAll('003').then(items => {
        this.lagerMap.set(new Map(items.map(i => [i.artikalId, i])));
      });
    })

    effect(() => {
      this.dataSource.filter = JSON.stringify([this.searchText().trim().toLowerCase(), this.showOnlyUnavailable()]);
    })

    effect(() => {
      this.dataSource.sort = this.sort() ?? null;
      if (this.dataSource.sort) {
        this.dataSource.sortingDataAccessor = (item, columnId) => {
          if (columnId === 'orderedQuantityTp') return item.numberOfOrderedTp;
          if (columnId === 'readyQuantity') return item.numberOfReadyTp ?? 0;
          if (columnId === 'remainingTp') return this.remainingTp(item);
          if (columnId === 'raspolozivoTp') return this.raspolozivoTp(item);
          return (item as any)[columnId];
        };
      }
    })
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText.set(filterValue);
  }

  toggleUnavailableFilter(checked: boolean) {
    this.showOnlyUnavailable.set(checked);
  }

  private orderItemsEqual(a: OrderItem[], b: OrderItem[]): boolean {
    if (a.length !== b.length) return false;
    const bMap = new Map(b.map(item => [item.id, item]));
    return a.every(item => {
      const other = bMap.get(item.id);
      return !!other && JSON.stringify(item) === JSON.stringify(other);
    });
  }

  private customFilterPredicate() {
    return (data: OrderItem): boolean => {
      const filterValue = this.searchText().trim().toLowerCase();
      const matchesSearch = !filterValue ||
        data.productCode.toLowerCase().includes(filterValue) ||
        data.productName.toLowerCase().includes(filterValue);
      const matchesToggle = !this.showOnlyUnavailable() ||
        (data.numberOfReadyTp ?? 0) < data.numberOfOrderedTp;

      return matchesSearch && matchesToggle;
    }
  }

  async onEditOrderItem(orderItem: OrderItem, flag: string) {
    const updatedOrderItem = await openEditOrderItemDialog(
      this.dialog,
      {
        mode: 'edit',
        orderId: orderItem.orderId,
        orderItem,
        title: 'Izmeni podatke',
        addFlag: flag
      }
    )
    if (updatedOrderItem) {
      this.orderItemUpdated.emit(updatedOrderItem);
    }

  }

  async onDeleteOrderItem(orderItemId: string) {
    const confirmation = await openConfirmationDialog(
      this.dialogForConfirmation,
      {
        message: 'Da li ste sigurni da želite da obrišete artikal sa trebovanja?',
        title: 'Potvrdi akciju'
      }
    );
    if (confirmation) {
      this.orderItemDeleted.emit(orderItemId);
    }
  }

  async exportOrderItemsToExcel(): Promise<void> {
    // Dinamički import - exceljs se ne učitava dok korisnik ne klikne export
    const ExcelJS = (await import('exceljs')).default;

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Export Tracking';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Stavke trebovanja', {
        pageSetup: {
            paperSize: 9, // A4 paper size
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            horizontalCentered: true,
            verticalCentered: false,
            margins: {
                left: 0.7,
                right: 0.7,
                top: 0.75,
                bottom: 0.75,
                header: 0.3,
                footer: 0.3
            }
        }
    });

    // Set print area and repeating rows for print
    worksheet.views = [
        {
            state: 'normal',
            zoomScale: 100,
            showGridLines: false
        }
    ];

    // Row height estimation for wrapped text (shared across export functions)
    const calculateRowHeight = (rowData: any[], columnWidths: number[]): number =>
        this.excelExportService.calculateRowHeight(rowData, columnWidths);

    // Define column widths (same as before)
    const columnWidths = [12, 28, 8, 9, 13, 12, 12, 14];

    // ========== ADD TITLE SECTION ==========
    const titleRow = worksheet.addRow([`Trebovanje - ${this.order()?.orderName} ${(this.order()?.customerId as Customer).name}`]);
    worksheet.mergeCells(`A${titleRow.number}:H${titleRow.number}`);
    titleRow.getCell(1).font = {
        bold: true,
        size: 16,
        name: 'Calibri',
        color: { argb: 'FF2C3E50' }
    };
    titleRow.getCell(1).alignment = {
        horizontal: 'center',
        vertical: 'middle'
    };
    titleRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F4F8' }
    };
    titleRow.height = 30;

    // Add empty row for spacing
    worksheet.addRow([]);

    // ========== ADD SUBTITLE / INFO ==========
    const infoRow = worksheet.addRow([`Datum generisanja: ${new Date().toLocaleDateString('sr-Latn')}`]);
    worksheet.mergeCells(`A${infoRow.number}:H${infoRow.number}`);
    infoRow.getCell(1).font = {
        italic: true,
        size: 10,
        name: 'Calibri',
        color: { argb: 'FF666666' }
    };
    infoRow.getCell(1).alignment = {
        horizontal: 'left',
        vertical: 'middle'
    };

    // Add another empty row for spacing before headers
    worksheet.addRow([]);

    // Add headers
    const headers = [
      'Šifra Artikla',
      'Naziv artikla',
      'Jed. mere',
      'JM u TP',
      'Trebovano u TP',
      'Odvojeno TP',
      'Lot',
      'Datum isteka'
    ];

    const headerRow = worksheet.addRow(headers);

    // Style header row
    headerRow.eachCell((cell) => this.excelExportService.styleHeaderCell(cell));
    
    // Calculate header row height based on content
    const headerHeight = calculateRowHeight(headers, columnWidths);
    headerRow.height = Math.max(25, headerHeight); // Minimum 25, otherwise calculated

    // Set rows to repeat at top for printing
    worksheet.pageSetup.printTitlesRow = `${headerRow.number}:${headerRow.number}`;

    // Create DatePipe for formatting dates
    const datePipe = new DatePipe('sr-Latn');

    // Prepare data rows first to calculate heights
    const exportItems = this.dataSource.filteredData;
    const dataRows = exportItems.map((item) => {
      const formattedDate = item.dateOfExpire
        ? datePipe.transform(item.dateOfExpire, 'dd MMM yyyy')
        : '';
      
      return [
        item.productCode || '',
        item.productName || '',
        item.jm || '',
        item.unitsInTransportBox || '',
        item.numberOfOrderedTp || 0,
        item.numberOfReadyTp || 0,
        item.lot || '',
        formattedDate || ''
      ];
    });

    // Add data rows with calculated heights
    dataRows.forEach((rowData, index) => {
      const row = worksheet.addRow(rowData);
      
      // Calculate height for this row based on content and column widths
      const rowHeight = calculateRowHeight(rowData, columnWidths);
      row.height = Math.max(18, rowHeight); // Minimum 18 pixels
      
      // Style data row cells
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        cell.font = {
          size: 10,
          name: 'Calibri',
          color: { argb: 'FF000000' }
        };

        if (index % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        }

        // Enable text wrapping
        // Right-align numeric columns
        if (colNumber === 4 || colNumber === 5 || colNumber === 6) {
          cell.alignment = {
            horizontal: 'right',
            vertical: 'top',
            wrapText: true
          };
          cell.numFmt = '#,##0';
        }
        // Center-align date column
        else if (colNumber === 8) {
          cell.alignment = {
            horizontal: 'center',
            vertical: 'top',
            wrapText: true
          };
        }
        // Left-align text columns
        else {
          cell.alignment = {
            horizontal: 'left',
            vertical: 'top',
            wrapText: true
          };
        }
      });
    });

    // Set column widths
    worksheet.columns.forEach((column, index) => {
      if (column) {
        column.width = columnWidths[index];
        column.alignment = { wrapText: true };
      }
    });

    // Add a summary row at the bottom
    if (exportItems.length > 0) {
      const totalOrderedTp = exportItems.reduce((sum, item) => sum + (item.numberOfOrderedTp || 0), 0);
      const totalReadyTp = exportItems.reduce((sum, item) => sum + (item.numberOfReadyTp || 0), 0);

      worksheet.addRow([]);

      const summaryRow = worksheet.addRow([
        'UKUPNO:',
        '',
        '',
        '',
        totalOrderedTp,
        totalReadyTp,
        '',
        ''
      ]);

      summaryRow.eachCell((cell, colNumber) => {
        cell.font = {
          bold: true,
          size: 11,
          name: 'Calibri',
          color: { argb: 'FF000000' }
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6F0FA' }
        };

        cell.border = {
          top: { style: 'medium' },
          left: { style: colNumber === 1 ? 'medium' : 'thin' },
          bottom: { style: 'medium' },
          right: { style: colNumber === 8 ? 'medium' : 'thin' }
        };

        cell.alignment = {
          horizontal: colNumber === 5 || colNumber === 6 ? 'right' : (colNumber === 1 ? 'right' : 'center'),
          vertical: 'middle',
          wrapText: true
        };

        if (colNumber === 5 || colNumber === 6) {
          cell.numFmt = '#,##0';
        }
      });

      worksheet.mergeCells(`A${summaryRow.number}:D${summaryRow.number}`);
      summaryRow.height = 22;
    }

    // Add footer information on each page
    worksheet.headerFooter = {
      differentFirst: false,
      differentOddEven: false,
      oddHeader: '',
      oddFooter: '&C&9Strana &P od &N',
      evenHeader: '',
      evenFooter: '&C&9Strana &P od &N'
    };

    // Generate and download file
    const fileName = `trebovanje-${this.order()?.orderName}-${new Date().toISOString().split('T')[0]}.xlsx`;
    await this.excelExportService.downloadWorkbook(workbook, fileName);
  }

  getRowClass(item: OrderItem): string {
    if(item.numberOfOrderedTp <= item.numberOfReadyTp!) {
      return 'completed';
    }
    return 'active';
  }

  numberOfPallets(item: OrderItem): number {
    if (!item.numberOfTpOnPallet) return 0;
    return item.numberOfOrderedTp / item.numberOfTpOnPallet;
  }

  readyPallets(item: OrderItem): number {
    if (!item.numberOfTpOnPallet) return 0;
    return (item.numberOfReadyTp ?? 0) / item.numberOfTpOnPallet;
  }

  remainingTp(item: OrderItem): number {
    return Math.max(0, item.numberOfOrderedTp - (item.numberOfReadyTp ?? 0));
  }

  raspolozivoTp(item: OrderItem): number {
    const lagerItem = this.lagerMap().get(item.productCode);
    if (!lagerItem || !lagerItem.artikalJmUTp) return 0;
    return (lagerItem.kolicina - lagerItem.rezervisano) / lagerItem.artikalJmUTp;
  }

  totalRaspolozivoTp(): number {
    return this.dataSource.filteredData.reduce((sum, item) => sum + this.raspolozivoTp(item), 0);
  }

  totalOrderedTp(): number {
    return this.dataSource.filteredData.reduce((sum, item) => sum + (item.numberOfOrderedTp || 0), 0);
  }

  totalPallets(): number {
    return this.dataSource.filteredData.reduce((sum, item) => sum + this.numberOfPallets(item), 0);
  }

  totalReadyTp(): number {
    return this.dataSource.filteredData.reduce((sum, item) => sum + (item.numberOfReadyTp || 0), 0);
  }

  totalRemainingTp(): number {
    return this.dataSource.filteredData.reduce((sum, item) => sum + this.remainingTp(item), 0);
  }

  totalReadyPallets(): number {
    return this.dataSource.filteredData.reduce((sum, item) => sum + this.readyPallets(item), 0);
  }
}
