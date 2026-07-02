import { CommonModule, DatePipe } from '@angular/common';
import { QtyPipe } from '../../pipes/qty.pipe';
import { Component, effect, input, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GroupedSupplyItem } from '../../models/supply-item.model';
import * as ExcelJS from 'exceljs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-supply-items-table',
  imports: [
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    ScrollingModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    QtyPipe,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [],
  templateUrl: './supply-items-table.html',
  styleUrl: './supply-items-table.scss',
})
export class SupplyItemsTable {
  supplyItems = input.required<GroupedSupplyItem[]>();
  orderId = input.required<string>();

  expandedElement = signal<GroupedSupplyItem | null>(null);

  displayedColumns: string[] = [
    'elementItemCode',
    'elementItemName',
    'unitOfMeasure',
    'totalQuantity',
    'availableQuantity',
    'actions'
  ]

  childDisplayedColumns: string[] = [
    'finishedProduct',
    'finishedProductName',
    'numberOfOrderedTp',
    'numberOfReadyTp',
    'orderName',
    'deliveryDate',
    'localQuantity',
    'allocatedQuantity',
  ];

  dataSource = new MatTableDataSource<GroupedSupplyItem>();
  sort = viewChild(MatSort);

  constructor() {
    effect(() => {
      this.dataSource.data = this.supplyItems();
      this.dataSource.filterPredicate = this.customFilterPredicate();
      console.log('Supply items:', this.supplyItems())
    })

    effect(() => {
      this.dataSource.sort = this.sort() ?? null;
      if (this.dataSource.sort) {
        this.dataSource.sortingDataAccessor = (item, columnId) => {
          if (columnId === 'unitOfMeasure') return item.elementItemUnitOfMeasure;
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
      return (data: GroupedSupplyItem, filter: string): boolean => {
        const filterValue = filter.trim().toLowerCase();
  
        return data.elementItemCode.toLowerCase().includes(filterValue) ||
               data.elementItemName.toLowerCase().includes(filterValue);
      }
    }
  

  toggleRow(supplyItem: GroupedSupplyItem) {
    supplyItem.isExpanded = !supplyItem.isExpanded;
    this.expandedElement.set(this.expandedElement() === supplyItem ? null : supplyItem);
  }

  
async exportToExcelFormatted(): Promise<void> {
  // Get the latest data from signals
  const currentSupplyItems = this.supplyItems();
  const currentOrderId = this.orderId();
  
  if (!currentSupplyItems || currentSupplyItems.length === 0) {
    console.warn('No data to export');
    return;
  }
  
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Your App';
  workbook.created = new Date();
  
  // Helper function to calculate row height based on content with larger font
  const calculateRowHeight = (rowData: any[], columnWidths: number[], fontSize: number = 11): number => {
    const baseFontSize = fontSize;
    const baseLineHeight = 1.2;
    const lineHeightPixels = baseFontSize * baseLineHeight;
    const padding = 6; // Slightly more padding for better readability
    
    let maxLines = 1;
    
    rowData.forEach((value, colIndex) => {
      const text = (value?.toString() || '').trim();
      if (text === '') return;
      
      const columnWidth = columnWidths[colIndex];
      if (!columnWidth) return;
      
      // Average character width in pixels for larger font
      const avgCharWidth = fontSize * 0.65; // Approximately 7.15px for 11pt font
      const maxCharsPerLine = Math.floor((columnWidth * 7) / avgCharWidth);
      
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
      
      const manualBreaks = (text.match(/\n/g) || []).length;
      lines = Math.max(lines, manualBreaks + 1);
      maxLines = Math.max(maxLines, lines);
    });
    
    return Math.min(maxLines * lineHeightPixels + padding, 180);
  };
  
  // Optimized column widths for details worksheet - better space utilization
  // A4 landscape has approximately 190-200 units of width available
  // Redistributing width to make better use of space
  const detailColumnWidths = [
    13,  // Šifra repromaterijala
    38,  // Naziv repromaterijala (wider - most important)
    13,  // Šifra GP
    38,  // Naziv GP (wider - most important)
    12,  // Poručeno TP
    12,  // Odvojeno TP
    22,  // Trebovanje
    14,  // Datum utovara
    16,  // Potrebna količina repromaterijala
    10   // Jedinica mere
  ];
  
  // Main column widths (optimized)
  const mainColumnWidths = [12, 38, 10, 16, 16];
  
  // ========== MAIN WORKSHEET ==========
  const mainWorksheet = workbook.addWorksheet('Pregled artikala', {
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true,
      verticalCentered: false,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      }
    }
  });
  
  mainWorksheet.views = [
    {
      state: 'normal',
      zoomScale: 100,
      showGridLines: false
    }
  ];
  
  // ========== ADD TITLE SECTION ==========
  const titleText = currentOrderId 
    ? `Pregled repromaterijala - Trebovanje: ${currentOrderId}`
    : 'Pregled repromaterijala - Sva trebovanja';
  
  const titleRow = mainWorksheet.addRow([titleText]);
  mainWorksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
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
  
  mainWorksheet.addRow([]);
  
  const infoRow = mainWorksheet.addRow([`Datum generisanja: ${new Date().toLocaleDateString('sr-Latn')}`]);
  mainWorksheet.mergeCells(`A${infoRow.number}:E${infoRow.number}`);
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
  
  mainWorksheet.addRow([]);
  
  // Add headers for main table
  const mainHeaders = [
    'Šifra Artikla',
    'Naziv Artikla',
    'Jed. mere',
    'Potrebna količina',
    'Dostupna količina'
  ];
  
  const mainHeaderRow = mainWorksheet.addRow(mainHeaders);
  
  mainHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 12,
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
  
  const mainHeaderHeight = calculateRowHeight(mainHeaders, mainColumnWidths, 12);
  mainHeaderRow.height = Math.max(28, mainHeaderHeight);
  
  mainWorksheet.pageSetup.printTitlesRow = `${mainHeaderRow.number}:${mainHeaderRow.number}`;
  
  const datePipe = new DatePipe('sr-Latn');
  
  // Prepare main data rows
  const mainDataRows = currentSupplyItems.map((item) => [
    item.elementItemCode || '',
    item.elementItemName || '',
    item.elementItemUnitOfMeasure || '',
    item.totalQuantity || 0,
    item.availableQuantity || 0
  ]);
  
  mainDataRows.forEach((rowData, mainIndex) => {
    const mainRow = mainWorksheet.addRow(rowData);
    
    const rowHeight = calculateRowHeight(rowData, mainColumnWidths, 11);
    mainRow.height = Math.max(20, rowHeight);
    
    mainRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      cell.font = {
        size: 11,
        name: 'Calibri',
        color: { argb: 'FF000000' }
      };
      
      if (mainIndex % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      }
      
      if (colNumber === 4 || colNumber === 5) {
        cell.alignment = {
          horizontal: 'right',
          vertical: 'top',
          wrapText: true
        };
        cell.numFmt = '#,##0.0000';
      } else {
        cell.alignment = {
          horizontal: 'left',
          vertical: 'top',
          wrapText: true
        };
      }
    });
  });
  
  mainWorksheet.columns.forEach((column, index) => {
    if (column) {
      column.width = mainColumnWidths[index];
    }
  });
  
  // Add summary row for main worksheet
  if (currentSupplyItems.length > 0) {
    const totalRequired = currentSupplyItems.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
    const totalAvailable = currentSupplyItems.reduce((sum, item) => sum + (item.availableQuantity || 0), 0);
    
    mainWorksheet.addRow([]);
    
    const summaryRow = mainWorksheet.addRow([
      'UKUPNO:',
      '',
      '',
      totalRequired,
      totalAvailable
    ]);
    
    summaryRow.eachCell((cell, colNumber) => {
      cell.font = {
        bold: true,
        size: 12,
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
        right: { style: colNumber === 5 ? 'medium' : 'thin' }
      };
      
      cell.alignment = {
        horizontal: colNumber === 4 || colNumber === 5 ? 'right' : (colNumber === 1 ? 'right' : 'center'),
        vertical: 'middle',
        wrapText: true
      };
      
      if (colNumber === 4 || colNumber === 5) {
        cell.numFmt = '#,##0.0000';
      }
    });
    
    mainWorksheet.mergeCells(`A${summaryRow.number}:C${summaryRow.number}`);
    summaryRow.height = 24;
  }
  
  mainWorksheet.headerFooter = {
    differentFirst: false,
    differentOddEven: false,
    oddHeader: '',
    oddFooter: '&C&10Strana &P od &N',
    evenHeader: '',
    evenFooter: '&C&10Strana &P od &N'
  };
  
  // ========== DETAILS WORKSHEET - OPTIMIZED FOR PRINTING ==========
  const hasChildItems = !currentOrderId && currentSupplyItems.some(item => item.items && item.items.length > 0);
  
  if (hasChildItems) {
    const detailsWorksheet = workbook.addWorksheet('Detalji po trebovanjima', {
      pageSetup: {
        paperSize: 9,
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalCentered: true,
        verticalCentered: false,
        margins: {
          left: 0.4,  // Reduced margins for more space
          right: 0.4,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3
        }
      }
    });
    
    detailsWorksheet.views = [
      {
        state: 'normal',
        zoomScale: 85, // Slightly reduced zoom for better overview
        showGridLines: false
      }
    ];
    
    // Add title for details worksheet
    const detailTitleRow = detailsWorksheet.addRow([`Detalji repromaterijala po trebovanjima`]);
    detailsWorksheet.mergeCells(`A${detailTitleRow.number}:J${detailTitleRow.number}`);
    detailTitleRow.getCell(1).font = {
      bold: true,
      size: 16,
      name: 'Calibri',
      color: { argb: 'FF2C3E50' }
    };
    detailTitleRow.getCell(1).alignment = {
      horizontal: 'center',
      vertical: 'middle'
    };
    detailTitleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F4F8' }
    };
    detailTitleRow.height = 30;
    
    detailsWorksheet.addRow([]);
    
    const detailInfoRow = detailsWorksheet.addRow([`Datum generisanja: ${new Date().toLocaleDateString('sr-Latn')}`]);
    detailsWorksheet.mergeCells(`A${detailInfoRow.number}:J${detailInfoRow.number}`);
    detailInfoRow.getCell(1).font = {
      italic: true,
      size: 10,
      name: 'Calibri',
      color: { argb: 'FF666666' }
    };
    detailInfoRow.getCell(1).alignment = {
      horizontal: 'left',
      vertical: 'middle'
    };
    
    detailsWorksheet.addRow([]);
    
    // Add headers for details table - shortened for better fit
    const detailHeaders = [
      'Šifra RM',
      'Naziv repromaterijala',
      'Šifra GP',
      'Naziv GP',
      'Poručeno TP',
      'Odvojeno TP',
      'Trebovanje',
      'Utovar',
      'Potrebna kol.',
      'JM'
    ];
    
    const detailHeaderRow = detailsWorksheet.addRow(detailHeaders);
    
    // Style detail header row with larger font
    detailHeaderRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5A9BD5' }
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
    
    const detailHeaderHeight = calculateRowHeight(detailHeaders, detailColumnWidths, 11);
    detailHeaderRow.height = Math.max(28, detailHeaderHeight);
    
    detailsWorksheet.pageSetup.printTitlesRow = `${detailHeaderRow.number}:${detailHeaderRow.number}`;
    
    // Prepare and add detail data rows with larger font
    let detailRowIndex = 0;
    let totalOrderedBoxes = 0;
    let totalReadyBoxes = 0;
    let totalLocalQuantity = 0;
    
    currentSupplyItems.forEach((item) => {
      if (item.items && item.items.length > 0) {
        item.items.forEach((childItem) => {
          const orderName = childItem.orderName || '';
          // Shorten delivery date format to save space
          const deliveryDate = childItem.deliveryDate 
            ? datePipe.transform(childItem.deliveryDate, 'dd.MM.yyyy') 
            : '';
          
          const orderedBoxes = childItem.totalOrderedBox || 0;
          const readyBoxes = childItem.totalReadyBox || 0;
          const localQty = childItem.localQuantity || 0;
          
          totalOrderedBoxes += orderedBoxes;
          totalReadyBoxes += readyBoxes;
          totalLocalQuantity += localQty;
          
          const rowData = [
            item.elementItemCode || '',
            item.elementItemName || '',
            childItem.productCode || '',
            childItem.productName || '',
            orderedBoxes,
            readyBoxes,
            orderName,
            deliveryDate || '',
            localQty,
            item.elementItemUnitOfMeasure || ''
          ];
          
          const detailRow = detailsWorksheet.addRow(rowData);
          
          const rowHeight = calculateRowHeight(rowData, detailColumnWidths, 11);
          detailRow.height = Math.max(22, rowHeight); // Taller rows for better readability
          
          detailRow.eachCell((cell, colNumber) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            
            // Larger font for better readability when printed
            cell.font = {
              size: 11,
              name: 'Calibri',
              color: { argb: 'FF000000' }
            };
            
            if (detailRowIndex % 2 === 1) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF9F9F9' }
              };
            }
            
            // Set alignment
            if (colNumber === 5 || colNumber === 6 || colNumber === 9) {
              cell.alignment = {
                horizontal: 'right',
                vertical: 'top',
                wrapText: true
              };
              if (colNumber === 9) {
                cell.numFmt = '#,##0.0000';
              } else {
                cell.numFmt = '#,##0';
              }
            } else if (colNumber === 8) {
              cell.alignment = {
                horizontal: 'center',
                vertical: 'top',
                wrapText: true
              };
            } else if (colNumber === 10) {
              cell.alignment = {
                horizontal: 'center',
                vertical: 'top',
                wrapText: true
              };
            } else {
              cell.alignment = {
                horizontal: 'left',
                vertical: 'top',
                wrapText: true
              };
            }
          });
          
          detailRowIndex++;
        });
      }
    });
    
    // Set optimized column widths
    detailsWorksheet.columns.forEach((column, index) => {
      if (column) {
        column.width = detailColumnWidths[index];
      }
    });
    
    // Add summary row
    if (detailRowIndex > 0) {
      detailsWorksheet.addRow([]);
      
      const detailSummaryRow = detailsWorksheet.addRow([
        'UKUPNO:',
        '',
        '',
        '',
        totalOrderedBoxes,
        totalReadyBoxes,
        '',
        '',
        totalLocalQuantity,
        ''
      ]);
      
      detailSummaryRow.eachCell((cell, colNumber) => {
        cell.font = {
          bold: true,
          size: 12,
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
          right: { style: colNumber === 10 ? 'medium' : 'thin' }
        };
        
        if (colNumber === 5 || colNumber === 6) {
          cell.alignment = {
            horizontal: 'right',
            vertical: 'middle',
            wrapText: true
          };
          cell.numFmt = '#,##0';
        } else if (colNumber === 9) {
          cell.alignment = {
            horizontal: 'right',
            vertical: 'middle',
            wrapText: true
          };
          cell.numFmt = '#,##0.0000';
        } else if (colNumber === 1) {
          cell.alignment = {
            horizontal: 'right',
            vertical: 'middle',
            wrapText: true
          };
        } else {
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true
          };
        }
      });
      
      detailsWorksheet.mergeCells(`A${detailSummaryRow.number}:B${detailSummaryRow.number}`);
      detailsWorksheet.mergeCells(`C${detailSummaryRow.number}:D${detailSummaryRow.number}`);
      detailsWorksheet.mergeCells(`G${detailSummaryRow.number}:H${detailSummaryRow.number}`);
      detailsWorksheet.mergeCells(`J${detailSummaryRow.number}:J${detailSummaryRow.number}`);
      detailSummaryRow.height = 24;
    }
    
    // Add footer with larger font indicator
    detailsWorksheet.headerFooter = {
      differentFirst: false,
      differentOddEven: false,
      oddHeader: '',
      oddFooter: '&C&10Strana &P od &N',
      evenHeader: '',
      evenFooter: '&C&10Strana &P od &N'
    };
  }
  
  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = currentOrderId 
    ? `pregled-repromaterijala-${currentOrderId}-${new Date().toISOString().split('T')[0]}.xlsx`
    : `pregled-repromaterijala-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}
  
}
