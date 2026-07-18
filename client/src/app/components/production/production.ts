import { Component, computed, DestroyRef, effect, inject, model, signal } from '@angular/core';
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
import { isHandledAuthError } from '../../services/error.interceptor';
import { RealtimeService } from '../../services/realtime.service';
import { RawMaterialAllocationService } from '../../services/raw-material-allocation.service';

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
  private allocationService = inject(RawMaterialAllocationService);
  private destroyRef = inject(DestroyRef);

  selected = model<string[]>([]);
  selectedOrders = model<string[]>([]);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  lastRefreshedAt = signal<Date | null>(null);

  private incompleteItems = computed(() =>
    this.#productionItems().filter(item => item.numberOfOrderedTp - (item.numberOfReadyTp ?? 0) > 0)
  );

  customers = computed(() => {
    const newCustomers = this.incompleteItems().map(item => item.orderId.customerId.name);
    return [...new Set(newCustomers)];
  });

  orderOptions = computed(() => {
    const selectedCustomers = this.selected();
    const seen = new Map<string, string>();
    for (const item of this.incompleteItems()) {
      const customerName = item.orderId.customerId.name ?? '';
      if (selectedCustomers.length > 0 && !selectedCustomers.includes(customerName)) continue;
      const id = item.orderId.id;
      if (id && !seen.has(id)) {
        seen.set(id, `${customerName} - ${item.orderId.orderName ?? ''}`);
      }
    }
    return Array.from(seen, ([id, label]) => ({ id, label }));
  });

  productionItemsForDisplay = computed(() => {
    let items = [...this.#productionItems()];

    if(this.startDate() && this.endDate()) {
      items = items.filter(item => {
        const date = new Date(item!.orderId!.deliveryDate!);
        return date >= this.startDate()! && date <= this.endDate()!;
      });
    }
    const selectedCustomers = this.selected();
    if(selectedCustomers.length > 0) {
      items = items.filter(item => selectedCustomers.includes(item.orderId.customerId.name ?? ''));
    }

    const selectedOrders = this.selectedOrders();
    if(selectedOrders.length > 0) {
      items = items.filter(item => selectedOrders.includes(item.orderId.id ?? ''));
    }

    items = items.filter(item => item.numberOfOrderedTp - (item.numberOfReadyTp ?? 0) > 0);

    return items;
  });

  groupedData = computed(() => {
    return this.groupProductionItems(this.productionItemsForDisplay());
  });

  constructor() {
    this.loadProductionItems()
      .then(() => console.log('Production items loaded', this.#productionItems()));
    this.loadRefreshStatus();

    effect(() => {
      const validIds = new Set(this.orderOptions().map(o => o.id));
      this.selectedOrders.update(ids => ids.filter(id => validIds.has(id)));
    });

    this.realtimeService.onDataChanged('order')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadProductionItems());

    this.realtimeService.onDataChanged('order-item')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadProductionItems());
  }

  private reloadProductionItems() {
    this.allocationService.invalidate();
    this.loadProductionItems();
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
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Greška pri učitavanju stavki za proizvodnju. Pokušajte ponovo.', 'error');
      }
    }
  }

  async loadRefreshStatus() {
    try {
      const status = await this.supplyService.getRefreshStatus();
      this.lastRefreshedAt.set(status.lastRefreshedAt ? new Date(status.lastRefreshedAt) : null);
      if (!status.apiAvailable) {
        this.messagesService.showMessage(
          'ERP (eksterni sistem) trenutno nije dostupan — normativi/zalihe se prikazuju iz rezervnih (keširanih) podataka.',
          'warning'
        );
      }
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
        existing.totalReadyTp += item.numberOfReadyTp ?? 0;
        existing.items.push(item);
      } else {
        groupedMap.set(item.productCode, {
          productCode: item.productCode,
          productName: item.productName,
          unitOfMeasure: item.jm,
          unitsInTransportBox: item.unitsInTransportBox,
          normativId: item.normativId,
          totalOrderedTp: item.numberOfOrderedTp,
          totalReadyTp: item.numberOfReadyTp ?? 0,
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
