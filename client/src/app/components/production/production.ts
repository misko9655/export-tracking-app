import { Component, computed, DestroyRef, inject, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductionService } from '../../services/production.service';
import { GroupedProductionItem, ProductionItem } from '../../models/production-item.model';
import { ProductionItemsTable } from '../production-items-table/production-items-table';
import { LoadingService } from '../../services/loading.service';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule} from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DateRange } from '../date-range/date-range';
import { NormativTop } from '../../models/normativ.model';
import { SupplyService } from '../../services/supply.service';
import { MessagesService } from '../../services/messages.service';
import { RealtimeService } from '../../services/realtime.service';

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

    MatButtonModule,
    DateRange
  ],
  providers: [],
  templateUrl: './production.html',
  styleUrl: './production.scss',
})
export class Production {
  #productionItems = signal<ProductionItem[]>([]);
  normativMap = signal<Map<string, NormativTop>>(new Map<string, NormativTop>());

  productionService = inject(ProductionService);
  supplyService = inject(SupplyService);
  loadingService = inject(LoadingService);
  private messagesService = inject(MessagesService);
  private realtimeService = inject(RealtimeService);
  private destroyRef = inject(DestroyRef);

  selected = model('all');
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  lastRefreshedAt = signal<Date | null>(null);

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
      });
    }
    if(this.selected() === 'all') {
      return items;
    } else {
      return items.filter(item => item.orderId.customerId.name === this.selected());
    }
  });

  groupedData = computed(() => {
    return this.groupProductionItems(this.productionItemsForDisplay());
  });

  constructor() {
    this.loadProductionItems()
      .then(() => console.log('Production items loaded', this.#productionItems()));
    this.loadRefreshStatus();

    this.realtimeService.onDataChanged('order')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadProductionItems());

    this.realtimeService.onDataChanged('order-item')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadProductionItems());
  }

  async loadProductionItems() {
    try {
      const items = await this.productionService.loadAllItemsForProduction();
      this.#productionItems.set(items);

      const uniqueNormativIds = [...new Set(items.map(i => i.normativId).filter(Boolean))];
      const normatives = await Promise.all(
        uniqueNormativIds.map(id => this.supplyService.findNormativById(id))
      );
      const map = new Map<string, NormativTop>();
      normatives.forEach(n => map.set(n.id, n));
      this.normativMap.set(map);
    } catch(error) {
      console.error('Error loading production items: ', error);
      this.messagesService.showMessage('Greška pri učitavanju stavki za proizvodnju. Pokušajte ponovo.', 'error');
    }
  }

  async loadRefreshStatus() {
    try {
      const status = await this.supplyService.getRefreshStatus();
      this.lastRefreshedAt.set(status.lastRefreshedAt ? new Date(status.lastRefreshedAt) : null);
    } catch (error) {
      console.error('Error loading refresh status: ', error);
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
          productName: item.productName,
          unitOfMeasure: item.jm,
          unitsInTransportBox: item.unitsInTransportBox,
          normativId: item.normativId,
          totalOrderedTp: item.numberOfOrderedTp,
          items: [item],
          isExpanded: false
        });
      }
    });

    return Array.from(groupedMap.values());
  }

  onRangeUpdated(range: { start: Date | null; end: Date | null }) {
    this.startDate.set(range.start);
    this.endDate.set(range.end);
  }
}
