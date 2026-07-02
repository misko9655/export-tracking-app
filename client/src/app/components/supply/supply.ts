import { Component, computed, DestroyRef, inject, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { SupplyService } from '../../services/supply.service';
import { LoadingService } from '../../services/loading.service';
import { GroupedSupplyItem, SupplyItem } from '../../models/supply-item.model';
import { SupplyItemsTable } from '../supply-items-table/supply-items-table';
import { DateRange } from '../date-range/date-range';
import { MessagesService } from '../../services/messages.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { RealtimeService } from '../../services/realtime.service';
import { RawMaterialAllocationService } from '../../services/raw-material-allocation.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-supply',
  imports: [
    SupplyItemsTable,
    DateRange,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    DatePipe,
  ],
  templateUrl: './supply.html',
  styleUrl: './supply.scss',
})
export class Supply {
  #rawItems = signal<SupplyItem[]>([]);
  #groupedGlobal = signal<GroupedSupplyItem[]>([]);
  private route = inject(ActivatedRoute);
  orderId = signal<string>(this.route.snapshot.params['orderId']);
  supplyService = inject(SupplyService);
  loadingService = inject(LoadingService);
  private messagesService = inject(MessagesService);
  private realtimeService = inject(RealtimeService);
  private allocationService = inject(RawMaterialAllocationService);
  private destroyRef = inject(DestroyRef);
  selected = model('all');
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  lastRefreshedAt = signal<Date | null>(null);

  customers = computed(() => {
    const names = this.#rawItems().map(item => item.orderId.customerId.name);
    return [...new Set(names)];
  });

  supplyItemsForDisplay = computed(() => {
    const orderIdFilter = this.orderId();
    const start = this.startDate();
    const end = this.endDate();
    const customer = this.selected();

    const result: GroupedSupplyItem[] = [];
    for (const group of this.#groupedGlobal()) {
      const filteredItems = group.items.filter(item => {
        if (orderIdFilter && item.orderId !== orderIdFilter) return false;
        if (start && end) {
          const date = new Date(item.deliveryDate);
          if (date < start || date > end) return false;
        }
        if (customer !== 'all' && item.customerName !== customer) return false;
        return true;
      });
      if (filteredItems.length === 0) continue;
      result.push({
        ...group,
        items: filteredItems,
        totalQuantity: filteredItems.reduce((sum, item) => sum + item.localQuantity, 0),
      });
    }
    return result;
  });

  constructor() {
    this.loadSupplyItems()
      .then(() => console.log('Supply items loaded', this.#rawItems()));
    this.loadRefreshStatus();

    this.realtimeService.onDataChanged('order-item')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadSupplyItems());

    this.realtimeService.onDataChanged('order')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadSupplyItems());
  }

  private reloadSupplyItems() {
    this.allocationService.invalidate();
    this.loadSupplyItems();
  }

  async loadSupplyItems() {
    try {
      const { items, grouped } = await this.allocationService.getGlobalAllocation();
      this.#rawItems.set(items);
      this.#groupedGlobal.set(grouped);
    } catch (error) {
      console.error('Error loading supply items: ', error);
      this.messagesService.showMessage('Greška pri učitavanju stavki za nabavku. Pokušajte ponovo.', 'error');
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

  onRangeUpdated(range: { start: Date | null; end: Date | null }) {
    this.startDate.set(range.start);
    this.endDate.set(range.end);
  }
}
