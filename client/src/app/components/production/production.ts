import { Component, computed, inject, model, signal } from '@angular/core';
import { ProductionService } from '../../services/production.service';
import { GroupedProductionItem, ProductionItem } from '../../models/production-item.model';
import { ProductionItemsTable } from '../production-items-table/production-items-table';
import { LoadingService } from '../../services/loading.service';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule} from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DateRange } from '../date-range/date-range';

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
    MatNativeDateModule,
    MatButtonModule,
    DateRange
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
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

 

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
  
  
  onRangeUpdated(range: { start: Date | null; end: Date | null }) {
    this.startDate.set(range.start);
    this.endDate.set(range.end);
  }
}
