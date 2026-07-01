import { Component, effect, inject, input, signal } from '@angular/core';
import { GroupedProductionItem, ProductionItem } from '../../models/production-item.model';
import { flattenMaterials, NormativNode, NormativTop } from '../../models/normativ.model';
import { MatDialog } from '@angular/material/dialog';
import { RawMaterialsAvailabilityDialog } from '../raw-materials-availability-dialog/raw-materials-availability-dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as ExcelJS from 'exceljs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ScrollingModule,  } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-production-items-table',
  imports: [
    MatTableModule,
    DatePipe,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ScrollingModule,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [],
  templateUrl: './production-items-table.html',
  styleUrl: './production-items-table.scss',
})
export class ProductionItemsTable {
  productionItems = input.required<GroupedProductionItem[]>();
  normativMap = input<Map<string, NormativTop>>(new Map<string, NormativTop>());

  dialog = inject(MatDialog);
  expandedElement = signal<GroupedProductionItem | null>(null);

  displayedColumns: string[] = [
    'productCode',
    'productName',
    'unitOfMeasure',
    'quantityInUnitOfMeasure',
    'numberOfOrderedTp',
    'rawMaterialAvailability',
    'actions',
  ]
  // Child table columns
  childDisplayedColumns: string[] = [ 
    'numberOfOrderedTp', 
    'numberOfReadyTp', 
    'customerName',
    'orderName',
    'deliveryDate'
  ];

  dataSource = new MatTableDataSource<GroupedProductionItem>();
  trackBy = (index: number, el: GroupedProductionItem) => el.productCode;

  constructor() {
    effect(() => {
      this.dataSource.data = this.productionItems();
      this.dataSource.filterPredicate = this.customFilterPredicate();
      console.log('Production items:',this.productionItems())
    })
  }

  applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    private customFilterPredicate() {
      return (data: GroupedProductionItem, filter: string): boolean => {
        const filterValue = filter.trim().toLowerCase();
  
        return data.productCode.toLowerCase().includes(filterValue) ||
               data.productName.toLowerCase().includes(filterValue);
      }
    }

  private getNodes(item: GroupedProductionItem): NormativNode[] {
    const normativ = this.normativMap().get(item.normativId);
    const rootNodes = (normativ?.tree[0] as any)?.nodes ?? [];
    return flattenMaterials(rootNodes);
  }

  isAvailable(item: GroupedProductionItem): boolean {
    const normativ = this.normativMap().get(item.normativId);
    const rootKolicinaGP: number = (normativ?.tree[0] as any)?.kolicinaGP ?? 1;
    const nodes = this.getNodes(item);
    if (!nodes.length) return true;
    const factor = rootKolicinaGP > 0 ? item.unitsInTransportBox / rootKolicinaGP : 0;
    return nodes.every(n => n.artikalZaliha >= item.totalOrderedTp * factor * n.kolicinaZaParentGP);
  }

  openModal(item: GroupedProductionItem) {
    const normativ = this.normativMap().get(item.normativId);
    const rootKolicinaGP: number = (normativ?.tree[0] as any)?.kolicinaGP ?? 1;
    this.dialog.open(RawMaterialsAvailabilityDialog, {
      data: {
        nodes: this.getNodes(item),
        totalOrderedTp: item.totalOrderedTp,
        unitsInTransportBox: item.unitsInTransportBox,
        rootKolicinaGP,
        productName: item.productName,
        productCode: item.productCode,
        items: item.items,
      },
      width: '95vw',
      maxWidth: '1100px',
      maxHeight: '90vh',
    });
  }

  toggleRow(productionItem: GroupedProductionItem) {
    productionItem.isExpanded = !productionItem.isExpanded;
    this.expandedElement.set(this.expandedElement() === productionItem ? null : productionItem);
  }

  async exportProductionItemsToExcel(): Promise<void> {
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Your App';
  workbook.created = new Date();
  
  // Create main worksheet for grouped items with A4 landscape setup
  const mainWorksheet = workbook.addWorksheet('Proizvodni Artikli', {
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
  
  // Set view options
  mainWorksheet.views = [
    {
      state: 'normal',
      zoomScale: 100,
      showGridLines: false
    }
  ];
  
  // Helper function to calculate row height based on content
  const calculateRowHeight = (rowData: any[], columnWidths: number[]): number => {
    const baseFontSize = 10;
    const baseLineHeight = 1.2;
    const lineHeightPixels = baseFontSize * baseLineHeight;
    const padding = 4;
    
    let maxLines = 1;
    
    rowData.forEach((value, colIndex) => {
      const text = (value?.toString() || '').trim();
      if (text === '') return;
      
      const columnWidth = columnWidths[colIndex];
      if (!columnWidth) return;
      
      const avgCharWidth = 6.5;
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
    
    return Math.min(maxLines * lineHeightPixels + padding, 150);
  };
  
  // Define column widths for main worksheet
  const mainColumnWidths = [12, 32, 10, 15, 18];
  
  // ========== ADD TITLE SECTION ==========
  const titleRow = mainWorksheet.addRow([`Proizvodni artikli - ${new Date().toLocaleDateString('sr-Latn')}`]);
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
  
  // Add empty row for spacing
  mainWorksheet.addRow([]);
  
  // Add info row
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
  
  // Add another empty row for spacing before headers
  mainWorksheet.addRow([]);
  
  // Add headers for main table
  const mainHeaders = [
    'Šifra Artikla',
    'Naziv Artikla',
    'Jed. mere',
    'Količina u JM',
    'Transportna pakovanja'
  ];
  
  const mainHeaderRow = mainWorksheet.addRow(mainHeaders);
  
  // Style main header row
  mainHeaderRow.eachCell((cell) => {
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
  
  // Calculate header row height
  const mainHeaderHeight = calculateRowHeight(mainHeaders, mainColumnWidths);
  mainHeaderRow.height = Math.max(25, mainHeaderHeight);
  
  // Set rows to repeat at top for printing
  mainWorksheet.pageSetup.printTitlesRow = `${mainHeaderRow.number}:${mainHeaderRow.number}`;
  
  // Create DatePipe for formatting dates
  const datePipe = new DatePipe('sr-Latn');
  
  // Prepare main data rows for height calculation
  const mainDataRows = this.productionItems().map((item) => {
    const quantityInUnitOfMeasure = (item.unitsInTransportBox || 0) * (item.totalOrderedTp || 0);
    return [
      item.productCode || '',
      item.productName || '',
      item.unitOfMeasure || '',
      quantityInUnitOfMeasure,
      item.totalOrderedTp || 0
    ];
  });
  
  // Add main data rows with calculated heights
  mainDataRows.forEach((rowData, mainIndex) => {
    const mainRow = mainWorksheet.addRow(rowData);
    
    // Calculate row height
    const rowHeight = calculateRowHeight(rowData, mainColumnWidths);
    mainRow.height = Math.max(18, rowHeight);
    
    // Style main row cells
    mainRow.eachCell((cell, colNumber) => {
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
      
      // Alternate row background (zebra striping)
      if (mainIndex % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      }
      
      // Set alignment based on column
      if (colNumber === 4 || colNumber === 5) { // Numeric columns
        cell.alignment = {
          horizontal: 'right',
          vertical: 'top',
          wrapText: true
        };
        cell.numFmt = '#,##0';
      } else {
        cell.alignment = {
          horizontal: 'left',
          vertical: 'top',
          wrapText: true
        };
      }
    });
  });
  
  // Set column widths for main worksheet
  mainWorksheet.columns.forEach((column, index) => {
    if (column) {
      column.width = mainColumnWidths[index];
    }
  });
  
  // Add summary row for main worksheet
  if (this.productionItems().length > 0) {
    const totalQuantityInJM = this.productionItems().reduce((sum, item) => 
      sum + ((item.unitsInTransportBox || 0) * (item.totalOrderedTp || 0)), 0);
    const totalTransportPackages = this.productionItems().reduce((sum, item) => 
      sum + (item.totalOrderedTp || 0), 0);
    
    mainWorksheet.addRow([]);
    
    const summaryRow = mainWorksheet.addRow([
      'UKUPNO:',
      '',
      '',
      totalQuantityInJM,
      totalTransportPackages
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
        right: { style: colNumber === 5 ? 'medium' : 'thin' }
      };
      
      cell.alignment = {
        horizontal: colNumber === 4 || colNumber === 5 ? 'right' : (colNumber === 1 ? 'right' : 'center'),
        vertical: 'middle',
        wrapText: true
      };
      
      if (colNumber === 4 || colNumber === 5) {
        cell.numFmt = '#,##0';
      }
    });
    
    mainWorksheet.mergeCells(`A${summaryRow.number}:C${summaryRow.number}`);
    summaryRow.height = 22;
  }
  
  // Add footer to main worksheet
  mainWorksheet.headerFooter = {
    differentFirst: false,
    differentOddEven: false,
    oddHeader: '',
    oddFooter: '&C&9Strana &P od &N',
    evenHeader: '',
    evenFooter: '&C&9Strana &P od &N'
  };
  
  // ========== DETAILS WORKSHEET ==========
  // Check if any items have child data
  const hasChildItems = this.productionItems().some(item => item.items && item.items.length > 0);
  
  if (hasChildItems) {
    // Create details worksheet with A4 landscape setup
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
          left: 0.7,
          right: 0.7,
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
        zoomScale: 100,
        showGridLines: false
      }
    ];
    
    // Define column widths for details worksheet
    const detailColumnWidths = [12, 32, 14, 14, 25, 20, 15];
    
    // Add title for details worksheet
    const detailTitleRow = detailsWorksheet.addRow([`Detalji proizvodnih artikala po trebovanjima`]);
    detailsWorksheet.mergeCells(`A${detailTitleRow.number}:G${detailTitleRow.number}`);
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
    
    // Add empty row for spacing
    detailsWorksheet.addRow([]);
    
    // Add info row
    const detailInfoRow = detailsWorksheet.addRow([`Datum generisanja: ${new Date().toLocaleDateString('sr-Latn')}`]);
    detailsWorksheet.mergeCells(`A${detailInfoRow.number}:G${detailInfoRow.number}`);
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
    
    // Add another empty row for spacing before headers
    detailsWorksheet.addRow([]);
    
    // Add headers for details table
    const detailHeaders = [
      'Šifra Artikla',
      'Naziv Artikla',
      'Poručeno TP',
      'Odvojeno TP',
      'Kupac',
      'Trebovanje',
      'Datum utovara'
    ];
    
    const detailHeaderRow = detailsWorksheet.addRow(detailHeaders);
    
    // Style detail header row
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
    
    // Calculate detail header height
    const detailHeaderHeight = calculateRowHeight(detailHeaders, detailColumnWidths);
    detailHeaderRow.height = Math.max(25, detailHeaderHeight);
    
    // Set rows to repeat at top for printing
    detailsWorksheet.pageSetup.printTitlesRow = `${detailHeaderRow.number}:${detailHeaderRow.number}`;
    
    // Prepare and add detail data rows
    let detailRowIndex = 0;
    this.productionItems().forEach((item) => {
      if (item.items && item.items.length > 0) {
        item.items.forEach((childItem) => {
          const customerName = childItem.orderId?.customerId?.name || '';
          const orderName = childItem.orderId?.orderName || '';
          const deliveryDate = childItem.orderId?.deliveryDate 
            ? datePipe.transform(childItem.orderId.deliveryDate, 'dd MMM yyyy') 
            : '';
          
          const rowData = [
            item.productCode || '',
            item.productName || '',
            childItem.numberOfOrderedTp || 0,
            childItem.numberOfReadyTp || 0,
            customerName,
            orderName,
            deliveryDate || ''
          ];
          
          const detailRow = detailsWorksheet.addRow(rowData);
          
          // Calculate row height
          const rowHeight = calculateRowHeight(rowData, detailColumnWidths);
          detailRow.height = Math.max(18, rowHeight);
          
          // Style detail row
          detailRow.eachCell((cell, colNumber) => {
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
            
            // Alternate row background
            if (detailRowIndex % 2 === 1) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF9F9F9' }
              };
            }
            
            // Set alignment
            if (colNumber === 3 || colNumber === 4) { // TP columns
              cell.alignment = {
                horizontal: 'right',
                vertical: 'top',
                wrapText: true
              };
              cell.numFmt = '#,##0';
            } else if (colNumber === 7) { // Date column
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
    
    // Set column widths for details worksheet
    detailsWorksheet.columns.forEach((column, index) => {
      if (column) {
        column.width = detailColumnWidths[index];
      }
    });
    
    // Add summary row for details worksheet
    if (detailRowIndex > 0) {
      const totalOrdered = this.productionItems().reduce((sum, item) => {
        if (item.items && item.items.length > 0) {
          return sum + item.items.reduce((childSum, child) => childSum + (child.numberOfOrderedTp || 0), 0);
        }
        return sum;
      }, 0);
      
      const totalReady = this.productionItems().reduce((sum, item) => {
        if (item.items && item.items.length > 0) {
          return sum + item.items.reduce((childSum, child) => childSum + (child.numberOfReadyTp || 0), 0);
        }
        return sum;
      }, 0);
      
      detailsWorksheet.addRow([]);
      
      const detailSummaryRow = detailsWorksheet.addRow([
        'UKUPNO:',
        '',
        totalOrdered,
        totalReady,
        '',
        '',
        ''
      ]);
      
      detailSummaryRow.eachCell((cell, colNumber) => {
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
          right: { style: colNumber === 7 ? 'medium' : 'thin' }
        };
        
        cell.alignment = {
          horizontal: colNumber === 3 || colNumber === 4 ? 'right' : (colNumber === 1 ? 'right' : 'center'),
          vertical: 'middle',
          wrapText: true
        };
        
        if (colNumber === 3 || colNumber === 4) {
          cell.numFmt = '#,##0';
        }
      });
      
      detailsWorksheet.mergeCells(`A${detailSummaryRow.number}:B${detailSummaryRow.number}`);
      detailsWorksheet.mergeCells(`E${detailSummaryRow.number}:G${detailSummaryRow.number}`);
      detailSummaryRow.height = 22;
    }
    
    // Add footer to details worksheet
    detailsWorksheet.headerFooter = {
      differentFirst: false,
      differentOddEven: false,
      oddHeader: '',
      oddFooter: '&C&9Strana &P od &N',
      evenHeader: '',
      evenFooter: '&C&9Strana &P od &N'
    };
  }
  
  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `proizvodni-artikli-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}
}
