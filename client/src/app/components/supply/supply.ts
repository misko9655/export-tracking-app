import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupplyService } from '../../services/supply.service';
import { LoadingService } from '../../services/loading.service';
import { GroupedSupplyItem, NormItem, SupplyItem } from '../../models/supply-item.model';
import { SupplyItemsTable } from '../supply-items-table/supply-items-table';
import { DateRange } from '../date-range/date-range';

@Component({
  selector: 'app-supply',
  imports: [
    SupplyItemsTable,
    DateRange
  ],
  templateUrl: './supply.html',
  styleUrl: './supply.scss',
})
export class Supply {
  #supplyItems = signal<SupplyItem[]>([])
  private route = inject(ActivatedRoute);
  private orderId = signal<string>(this.route.snapshot.params['orderId']);
  supplyService = inject(SupplyService);
  loadingService = inject(LoadingService);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  constructor() {
    effect(() => {
      console.log(`Order Id from route: ${this.orderId()}`);
      console.log('Supply items:', this.#supplyItems())
    })

    this.loadSupplyItems()
      .then(() => console.log('Supply items load successfully', this.#supplyItems()));

  }

  supplyItemsForDisplay = computed(() => {
    let items = [...this.#supplyItems()];

    if(this.startDate() && this.endDate()) {
      items = items.filter(item => {
        const date = new Date(item.orderId.deliveryDate!);
        return date >= this.startDate()! && date <= this.endDate()!;
      })
    }
    return this.groupSupplyItems(items);
  })

  async loadSupplyItems() {
    try {
      let items: SupplyItem[];
      if(this.orderId()){
        items = await this.supplyService.findAllItemsforOrder(this.orderId());
        this.#supplyItems.set(items);
        this.groupSupplyItems(this.#supplyItems());
      } else {
        items = await this.supplyService.findAllItems();
        this.#supplyItems.set(items);
        this.groupSupplyItems(this.#supplyItems());
      }
    }
    catch (error) {
      console.error('Error loading production items: ', error);
    }

  }

  onRangeUpdated(range: { start: Date | null; end: Date | null }) {
    this.startDate.set(range.start);
    this.endDate.set(range.end);
  }

  private groupSupplyItems(items: SupplyItem[]) {
    const groupedMap = new Map<string, GroupedSupplyItem>();
    const norms = items.flatMap(item => {
      const normArr = item.productId.norms;
      const norm903 = normArr.find(norm => norm.elementType === 'Gotov proizvod');
      let factor = 1
      if(norm903 && norm903.elementItemQuantity !== item.productId.unitsInTransportBox) {
        factor = item.productId.unitsInTransportBox! / norm903.elementItemQuantity;
      }
      return normArr.map(norm => {
        return {
          norm: {...norm, elementItemQuantity: norm.elementItemQuantity * factor},
          unitsInTransportBox: item.productId.unitsInTransportBox,
          totalOrderedBox: item.numberOfOrderedTp,
          normUnits: norm.elementItemUnitOfMeasure
        }
      }).filter(element => element.norm.elementType !== 'Gotov proizvod');
    });
    console.log(norms);

    norms.forEach(norm => {
      const existing = groupedMap.get(norm.norm.elementItemCode);

      if (existing) {
        let num = 0;
        if ((norm.unitsInTransportBox !== norm.norm.elementItemQuantity) && (norm.norm.elementType === 'Gotov proizvod')) {
          num = norm.norm.elementItemQuantity / norm.unitsInTransportBox!;
        }
        existing.totalQuantity += norm.totalOrderedBox * norm.norm.elementItemQuantity;

        existing.items.push(norm as NormItem);
      } else {
        groupedMap.set(norm.norm.elementItemCode, {
          elementItemCode: norm.norm.elementItemCode,        // Ključ za grupisanje
          elementItemName: norm.norm.elementItemName,       // Naziv artikla
          elementItemUnitOfMeasure: norm.norm.elementItemUnitOfMeasure, // Jedinica mere
          totalQuantity: norm.totalOrderedBox * norm.norm.elementItemQuantity,         // Ukupna količina
          items: [norm as NormItem]
        })
        console.log(norm.norm.elementItemQuantity, norm.norm.normCode);
      }
    });
    console.log('log', groupedMap);
    return Array.from(groupedMap.values())

  }
}
