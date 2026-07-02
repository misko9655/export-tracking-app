import { Component, effect, inject, input, output, viewChild } from '@angular/core';
import { OrderItem } from '../../models/order-item.model';
import { MatDialog } from '@angular/material/dialog';
import { openEditOrderItemDialog } from '../edit-order-item-dialog/edit-order-item-dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { openConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { DatePipe } from '@angular/common';
import * as ExcelJS from 'exceljs';
import { Order } from '../../models/order.model';
import { Customer } from '../../models/customer.model';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-order-items-table',
  imports: [
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    DatePipe,
    MatFormField,
    MatInputModule,
    ScrollingModule
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
  displayedColumns = [
    'productCode',
    'productName',
    'unitOfMeasure',
    'unitsInTransportBox',
    'orderedQuantityTp',
    'numberOfPallets',
    'readyQuantity',
    'lot',
    'dateOfExpire',
    'actions'
  ];
  dataSource = new MatTableDataSource<OrderItem>();
  trackBy = (index: number, el: OrderItem) => el.id;
  sort = viewChild(MatSort);

  constructor() {
    effect(() => {
      this.dataSource.data = this.orderItems();
      this.dataSource.filterPredicate = this.customFilterPredicate();
      console.log('Order items: ', this.orderItems());
    })

    effect(() => {
      this.dataSource.sort = this.sort() ?? null;
      if (this.dataSource.sort) {
        this.dataSource.sortingDataAccessor = (item, columnId) => {
          if (columnId === 'unitOfMeasure') return item.jm;
          if (columnId === 'orderedQuantityTp') return item.numberOfOrderedTp;
          if (columnId === 'readyQuantity') return item.numberOfReadyTp ?? 0;
          return (item as any)[columnId];
        };
      }
    })
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  private customFilterPredicate() {
    return (data: OrderItem, filter: string): boolean => {
      const filterValue = filter.trim().toLowerCase();

      return data.productCode.toLowerCase().includes(filterValue) ||
             data.productName.toLowerCase().includes(filterValue);
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
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Your App';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Order Items', {
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

    // Helper function to calculate row height based on content
    const calculateRowHeight = (rowData: any[], columnWidths: number[]): number => {
        const baseFontSize = 10;
        const baseLineHeight = 1.2; // Line height multiplier
        const lineHeightPixels = baseFontSize * baseLineHeight; // ~12 pixels per line
        const padding = 4; // Extra padding
        
        let maxLines = 1;
        
        rowData.forEach((value, colIndex) => {
            const text = (value?.toString() || '').trim();
            if (text === '') return;
            
            const columnWidth = columnWidths[colIndex];
            if (!columnWidth) return;
            
            // Average character width in pixels for Calibri 10pt (approx 6.5 pixels per character)
            const avgCharWidth = 6.5;
            const maxCharsPerLine = Math.floor((columnWidth * 7) / avgCharWidth); // Convert Excel width units to approximate characters
            
            // Split text by spaces to simulate word wrap
            const words = text.split(' ');
            let lines = 1;
            let currentLineLength = 0;
            
            for (const word of words) {
                const wordLength = word.length;
                if (currentLineLength + wordLength + 1 > maxCharsPerLine) {
                    lines++;
                    currentLineLength = wordLength;
                } else {
                    currentLineLength += wordLength + 1;
                }
            }
            
            // Check for manual line breaks
            const manualBreaks = (text.match(/\n/g) || []).length;
            lines = Math.max(lines, manualBreaks + 1);
            
            maxLines = Math.max(maxLines, lines);
        });
        
        // Calculate height: (number of lines * line height) + padding
        return Math.min(maxLines * lineHeightPixels + padding, 150); // Max height 150 pixels
    };

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
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 11,
        name: 'Calibri'
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Calculate header row height based on content
    const headerHeight = calculateRowHeight(headers, columnWidths);
    headerRow.height = Math.max(25, headerHeight); // Minimum 25, otherwise calculated

    // Set rows to repeat at top for printing
    worksheet.pageSetup.printTitlesRow = `${headerRow.number}:${headerRow.number}`;

    // Create DatePipe for formatting dates
    const datePipe = new DatePipe('sr-Latn');

    // Prepare data rows first to calculate heights
    const dataRows = this.orderItems().map((item) => {
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
    if (this.orderItems().length > 0) {
      const totalOrderedTp = this.orderItems().reduce((sum, item) => sum + (item.numberOfOrderedTp || 0), 0);
      const totalReadyTp = this.orderItems().reduce((sum, item) => sum + (item.numberOfReadyTp || 0), 0);

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
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `trebovanje-${this.order()?.orderName}-${new Date().toISOString().split('T')[0]}.xlsx`;

    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getRowClass(item: OrderItem): string {
    if(item.numberOfOrderedTp <= item.numberOfReadyTp!) {
      return 'completed';
    }
    return 'active';
  }
}
