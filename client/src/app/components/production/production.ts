import { Component, computed, inject, model, signal } from '@angular/core';
import { ProductionService } from '../../services/production.service';
import { GroupedProductionItem, ProductionItem } from '../../models/production-item.model';
import { ProductionItemsTable } from '../production-items-table/production-items-table';
import { LoadingService } from '../../services/loading.service';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-production',
  imports: [
    ProductionItemsTable,
    MatSelectModule,
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    DatePipe,
    MatNativeDateModule,
    MatButtonModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'sr-Latn'}
  ],
  templateUrl: './production.html',
  styleUrl: './production.scss',
})
export class Production {
  #productionItems = signal<ProductionItem[]>([]);

  productionService = inject(ProductionService);
  loadingService = inject(LoadingService);

  selected = model('all');
  startDate = model<Date | null>(null);
  endDate = model<Date | null>(null);

  selectedRange = signal<{start: Date | null; end: Date | null}>({
    start: null,
    end: null
  });

  customers = computed(() => {
    const newCustomers = this.#productionItems().map(item => item.orderId.customerId.name);
    return [...new Set(newCustomers)];
  });

  productionItemsForDisplay = computed(() => {
    let items = [...this.#productionItems()];

    if(this.startDate() && this.endDate()) {
      items = items.filter(item => {
        const date = new Date(item!.orderId!.deliveryDate!);
        return date >= this.startDate()! && date <= this.endDate()!;
      })
    }
    if(this.selected() === 'all') {
      return items;
    } else {
      return items.filter(item => item.orderId.customerId.name === this.selected());
    }
  });

  groupedData = computed(() => {
    return this.groupProductionItems(this.productionItemsForDisplay());
  })


  constructor() {
    this.loadProductionItems()
      .then(() => console.log('Order items load successfully', this.#productionItems()));
    
    this.updateRangeSignal();
    this.groupedData();
  }

  async loadProductionItems() {
    try {
      const items = await this.productionService.loadAllItemsForProduction();
      this.#productionItems.set(items);
    }
    catch(error) {
      console.error('Error loading production items: ', error);
    }

  }

  private groupProductionItems(items: ProductionItem[]): GroupedProductionItem[] {
    const groupedMap = new Map<string, GroupedProductionItem>();

    items.forEach(item => {
      const existing = groupedMap.get(item.productCode);

      if(existing) {
        existing.totalOrderedTp += item.numberOfOrderedTp;
        existing.items.push(item);
      } else {
        groupedMap.set(item.productCode, {
          productCode: item.productCode,
          productName: item.productId.productName!,
          unitOfMeasure: item.productId.unitOfMeasure!,
          unitsInTransportBox: item.productId.unitsInTransportBox!,
          totalOrderedTp: item.numberOfOrderedTp,
          items: [item],
          isExpanded: false
        })
      }
    });
    console.log('log', groupedMap);
    return Array.from(groupedMap.values())
  }
  
  private updateRangeSignal() {
    this.selectedRange.set({
      start: this.startDate(),
      end: this.endDate()
    })
  }

  onStartDateChange() {
    if (this.endDate() && this.startDate() && this.endDate()! < this.startDate()!) {
      this.endDate.set(null);
    }
    this.updateRangeSignal();
  }

  onEndDateChange() {
    if (this.startDate() && this.endDate() && this.endDate()! < this.startDate()!) {
      this.endDate.set(null);
    } else {
      this.updateRangeSignal();
    }
  }

  clearDates() {
    this.startDate.set(null);
    this.endDate.set(null);
    this.updateRangeSignal();
  }

  applySelection() {
    if (this.selectedRange().start && this.selectedRange().end) {
      console.log('Applied date range:', {
        start: this.selectedRange().start,
        end: this.selectedRange().end,
        days: this.daysBetween()
      });
      alert(`Date range applied! Check console for details.`);
    }
  }

  daysBetween = computed(() => {
    const start = this.selectedRange().start;
    const end = this.selectedRange().end;
    
    if (start && end && start <= end) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  });

  weekdaysBetween = computed(() => {
    const start = this.selectedRange().start;
    const end = this.selectedRange().end;
    
    if (start && end && start <= end) {
      let count = 0;
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return count;
    }
    return 0;
  });

  // Quick range methods




  setThisMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.startDate.set(start);
    this.endDate.set(end);
    this.updateRangeSignal();
  }

  setNextWeek() {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    
    this.startDate.set(start);
    this.endDate.set(end);
    this.updateRangeSignal();
  }

  isValidRange = computed(() => {
  const start = this.selectedRange().start;
  const end = this.selectedRange().end;
  return !!(start && end && start <= end);
});
hasBothDateSelected = computed(() => 
  !!(this.selectedRange().start && this.selectedRange().end)
);

}
