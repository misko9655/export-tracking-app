import { Component, effect, input } from '@angular/core';
import { ProductionItem } from '../../models/production-item.model';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-production-items-table',
  imports: [
    MatTableModule,
    DatePipe,
    MatProgressSpinnerModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './production-items-table.html',
  styleUrl: './production-items-table.scss',
})
export class ProductionItemsTable {
  productionItems = input.required<ProductionItem[]>();

  displayedColumns: string[] = [
    'productCode',
    'elementItemName',
    'numberOfOrderedTp',
    'customerName',
    'orderName',
    'deliveryDate'
  ]

  constructor() {
    effect(() => {
      console.log('Production items:',this.productionItems())
    })
  }
}
