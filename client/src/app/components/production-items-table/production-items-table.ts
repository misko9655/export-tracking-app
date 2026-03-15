import { Component, effect, input, signal } from '@angular/core';
import { GroupedProductionItem, ProductionItem } from '../../models/production-item.model';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@Component({
  selector: 'app-production-items-table',
  imports: [
    MatTableModule,
    DatePipe,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './production-items-table.html',
  styleUrl: './production-items-table.scss',
})
export class ProductionItemsTable {
  productionItems = input.required<GroupedProductionItem[]>();

  expandedElement = signal<GroupedProductionItem | null>(null);

  displayedColumns: string[] = [
    'productCode',
    'productName',
    'unitOfMeasure',
    'quantityInUnitOfMeasure',
    'numberOfOrderedTp',
    'actions'
    // 'customerName',
    // 'orderName',
    // 'deliveryDate'
  ]
  // Child table columns
  childDisplayedColumns: string[] = [ 
    'numberOfOrderedTp', 
    'numberOfReadyTp', 
    'customerName',
    'orderName',
    'deliveryDate'
  ];

  constructor() {
    effect(() => {
      console.log('Production items:',this.productionItems())
    })
  }

  toggleRow(productionItem: GroupedProductionItem) {
    productionItem.isExpanded = !productionItem.isExpanded;
    this.expandedElement.set(this.expandedElement() === productionItem ? null : productionItem);
  }
}
