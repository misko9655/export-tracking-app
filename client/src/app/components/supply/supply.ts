import { Component, computed, DestroyRef, inject, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { SupplyService } from '../../services/supply.service';
import { LoadingService } from '../../services/loading.service';
import { GroupedSupplyItem, NormItem, SupplyItem } from '../../models/supply-item.model';
import { SupplyItemsTable } from '../supply-items-table/supply-items-table';
import { DateRange } from '../date-range/date-range';
import { flattenMaterials, NormativNode, NormativTop } from '../../models/normativ.model';
import { MessagesService } from '../../services/messages.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { RealtimeService } from '../../services/realtime.service';
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
  #supplyItems = signal<SupplyItem[]>([]);
  #normativMap = new Map<string, NormativTop>();
  private route = inject(ActivatedRoute);
  orderId = signal<string>(this.route.snapshot.params['orderId']);
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
    const names = this.#supplyItems().map(item => item.orderId.customerId.name);
    return [...new Set(names)];
  });

  supplyItemsForDisplay = computed(() => {
    let items = [...this.#supplyItems()];

    if (this.startDate() && this.endDate()) {
      items = items.filter(item => {
        const date = new Date(item.orderId.deliveryDate!);
        return date >= this.startDate()! && date <= this.endDate()!;
      });
    }
    if (this.selected() !== 'all') {
      items = items.filter(item => item.orderId.customerId.name === this.selected());
    }
    return this.groupSupplyItems(items);
  });

  constructor() {
    this.loadSupplyItems()
      .then(() => console.log('Supply items loaded', this.#supplyItems()));
    this.loadRefreshStatus();

    this.realtimeService.onDataChanged('order-item')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadSupplyItems());

    this.realtimeService.onDataChanged('order')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadSupplyItems());
  }

  async loadSupplyItems() {
    try {
      const items = await (this.orderId()
        ? this.supplyService.findAllItemsforOrder(this.orderId())
        : this.supplyService.findAllItems());

      const uniqueNormativIds = [...new Set(items.map(i => i.normativId).filter(Boolean))];
      const normatives = await Promise.all(
        uniqueNormativIds.map(id => this.supplyService.findNormativById(id))
      );
      this.#normativMap.clear();
      normatives.forEach(n => this.#normativMap.set(n.id, n));

      this.#supplyItems.set(items);
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

  private mapNodesToNormItems(item: SupplyItem, nodes: NormativNode[], rootKolicinaGP: number): NormItem[] {
    const totalNeededBox = item.numberOfOrderedTp - item.numberOfReadyTp;
    const totalNeededUnits = totalNeededBox * item.unitsInTransportBox;
    return nodes
      .map(node => ({
        node,
        productCode: item.productCode,
        productName: item.productName,
        unitsInTransportBox: item.unitsInTransportBox,
        totalNeededBox,
        totalOrderedBox: item.numberOfOrderedTp,
        totalReadyBox: item.numberOfReadyTp,
        orderName: item.orderId.customerId.name + ' ' + item.orderId.orderName,
        deliveryDate: item.orderId.deliveryDate as Date,
        localQuantity: rootKolicinaGP > 0
          ? (totalNeededUnits / rootKolicinaGP) * node.kolicinaZaParentGP
          : 0,
        allocatedQuantity: 0,
      }))
      .filter(normItem => normItem.totalNeededBox > 0);
  }

  private processSupplyItem(item: SupplyItem): NormItem[] {
    const normativ = this.#normativMap.get(item.normativId);
    if (!normativ) return [];
    const root = normativ.tree[0] as any;
    const rootKolicinaGP: number = root?.kolicinaGP ?? 1;
    const materialNodes = flattenMaterials((root?.nodes ?? []) as NormativNode[]);
    return this.mapNodesToNormItems(item, materialNodes, rootKolicinaGP);
  }

  private buildGroupedMap(normItems: NormItem[]): Map<string, GroupedSupplyItem> {
    const groupedMap = new Map<string, GroupedSupplyItem>();

    normItems.forEach(normItem => {
      const key = normItem.node.artikalId;
      const existing = groupedMap.get(key);

      if (existing) {
        existing.totalQuantity += normItem.localQuantity;
        const childKey = `${normItem.productCode}|${normItem.orderName}`;
        const existingChild = existing.items.find(
          item => `${item.productCode}|${item.orderName}` === childKey
        );
        if (existingChild) {
          existingChild.localQuantity += normItem.localQuantity;
        } else {
          existing.items.push(normItem);
        }
      } else {
        groupedMap.set(key, {
          elementItemCode: normItem.node.artikalId,
          elementItemName: normItem.node.artikalNaziv,
          elementItemUnitOfMeasure: normItem.node.artikalJm,
          totalQuantity: normItem.localQuantity,
          availableQuantity: normItem.node.artikalZaliha,
          items: [normItem],
        });
      }
    });

    return groupedMap;
  }

  private allocateStock(grouped: GroupedSupplyItem[]): void {
    for (const group of grouped) {
      const sorted = [...group.items].sort(
        (a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
      );
      let remaining = group.availableQuantity;
      for (const item of sorted) {
        item.allocatedQuantity = Math.min(remaining, item.localQuantity);
        remaining = Math.max(0, remaining - item.localQuantity);
      }
    }
  }

  private groupSupplyItems(items: SupplyItem[]): GroupedSupplyItem[] {
    const normItems = items.flatMap(item => this.processSupplyItem(item));
    const groupedMap = this.buildGroupedMap(normItems);
    const grouped = Array.from(groupedMap.values());
    this.allocateStock(grouped);
    return grouped;
  }
}
