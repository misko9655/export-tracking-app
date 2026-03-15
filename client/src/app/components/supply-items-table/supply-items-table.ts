import { CommonModule } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { GroupedSupplyItem } from '../../models/supply-item.model';

@Component({
  selector: 'app-supply-items-table',
  imports: [
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './supply-items-table.html',
  styleUrl: './supply-items-table.scss',
})
export class SupplyItemsTable {
  supplyItems = input.required<GroupedSupplyItem[]>();

  // expandedElement = signal<GroupedSupplyItem | null>(null);

  displayedColumns: string[] = [
    'elementItemCode',
    'elementItemName',
    'unitOfMeasure',
    'totalQuantity',

    // 'customerName',
    // 'orderName',
    // 'deliveryDate'
  ]
  // Child table columns
  // childDisplayedColumns: string[] = [ 
  //   'numberOfOrderedTp', 
  //   'numberOfReadyTp', 
  //   'customerName',
  //   'orderName',
  //   'deliveryDate'
  // ];

  constructor() {
    effect(() => {
      console.log('Production items:',this.supplyItems())
    })
  }
}
