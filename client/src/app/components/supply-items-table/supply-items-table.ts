import { CommonModule, DatePipe } from '@angular/common';
import { QtyPipe } from '../../pipes/qty.pipe';
import { QtyFormatPipe } from '../../pipes/qty-format.pipe';
import { QtyTooltipPipe } from '../../pipes/qty-tooltip.pipe';
import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
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
import { ExcelExportService } from '../../services/excel-export.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


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
    MatSlideToggleModule,
    QtyPipe,
    QtyFormatPipe,
    QtyTooltipPipe,
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
  private excelExportService = inject(ExcelExportService);

  displayedColumns = computed<string[]>(() => {
    const cols = ['elementItemCode', 'elementItemName', 'unitOfMeasure', 'totalQuantity', 'availableQuantity'];
    if (this.orderId()) cols.push('warehouseStock');
    cols.push('customsQuantity', 'actions');
    return cols;
  });

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
  searchText = signal('');
  showOnlyUnavailable = signal(false);
  showOnlySurplus = signal(false);

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
          if (columnId === 'warehouseStock') return item.availableQuantity;
          return (item as any)[columnId];
        };
      }
    })

    effect(() => {
      this.dataSource.filter = JSON.stringify([
        this.searchText().trim().toLowerCase(),
        this.showOnlyUnavailable(),
        this.showOnlySurplus(),
      ]);
    })
  }

   applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.searchText.set(filterValue);
    }

    toggleUnavailableFilter(checked: boolean) {
      this.showOnlyUnavailable.set(checked);
    }

    toggleSurplusFilter(checked: boolean) {
      this.showOnlySurplus.set(checked);
    }

    /**
     * Dostupna količina u trenutnom kontekstu prikaza. Kad je prikaz filtriran na jedno trebovanje,
     * `allocatedQuantity` već uključuje eventualni doprinos iz carinskog magacina (allocateStock()
     * prvo raspoređuje availableQuantity, pa tek onda customsQuantity) — ne treba ga ponovo dodavati.
     * U prikazu "sva trebovanja" koristi se sirova zaliha, pa se carinski magacin dodaje eksplicitno.
     */
    effectiveAvailable(item: GroupedSupplyItem): number {
      if (this.orderId()) {
        return item.allocatedQuantity;
      }
      return item.availableQuantity + (item.customsQuantity ?? 0);
    }

    private customFilterPredicate() {
      return (data: GroupedSupplyItem): boolean => {
        const filterValue = this.searchText().trim().toLowerCase();
        const matchesSearch = !filterValue ||
          data.elementItemCode.toLowerCase().includes(filterValue) ||
          data.elementItemName.toLowerCase().includes(filterValue);

        const available = this.effectiveAvailable(data);
        const matchesUnavailable = !this.showOnlyUnavailable() || data.totalQuantity > available;
        const matchesSurplus = !this.showOnlySurplus() || available > 3 * data.totalQuantity;

        return matchesSearch && matchesUnavailable && matchesSurplus;
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
  workbook.creator = 'Export Tracking';
  workbook.created = new Date();
  
  // Row height estimation for wrapped text (shared across export functions)
  const calculateRowHeight = (rowData: any[], columnWidths: number[], fontSize: number = 11): number =>
    this.excelExportService.calculateRowHeight(rowData, columnWidths, {
      fontSize,
      padding: 6,
      maxHeight: 180,
      avgCharWidthFactor: 0.65,
    });
  
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
  const mainColumnWidths = [12, 38, 10, 16, 16, 16];
  
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
  mainWorksheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
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
  mainWorksheet.mergeCells(`A${infoRow.number}:F${infoRow.number}`);
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
    'Dostupna količina',
    'Carinski magacin'
  ];
  
  const mainHeaderRow = mainWorksheet.addRow(mainHeaders);
  
  mainHeaderRow.eachCell((cell) =>
    this.excelExportService.styleHeaderCell(cell, { fontSize: 12 })
  );
  
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
    item.availableQuantity || 0,
    item.customsQuantity || 0
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
      
      if (colNumber === 4 || colNumber === 5 || colNumber === 6) {
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
    detailHeaderRow.eachCell((cell) =>
      this.excelExportService.styleHeaderCell(cell, { fillColor: 'FF5A9BD5' })
    );
    
    const detailHeaderHeight = calculateRowHeight(detailHeaders, detailColumnWidths, 11);
    detailHeaderRow.height = Math.max(28, detailHeaderHeight);
    
    detailsWorksheet.pageSetup.printTitlesRow = `${detailHeaderRow.number}:${detailHeaderRow.number}`;
    
    // Prepare and add detail data rows with larger font
    let detailRowIndex = 0;

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
  const fileName = currentOrderId
    ? `pregled-repromaterijala-${currentOrderId}-${new Date().toISOString().split('T')[0]}.xlsx`
    : `pregled-repromaterijala-${new Date().toISOString().split('T')[0]}.xlsx`;
  await this.excelExportService.downloadWorkbook(workbook, fileName);
}
  
}
