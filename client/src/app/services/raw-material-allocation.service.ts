import { inject, Injectable } from '@angular/core';
import { SupplyService } from './supply.service';
import { LagerService } from './lager.service';
import { GroupedSupplyItem, NormItem, SupplyItem } from '../models/supply-item.model';
import { flattenMaterials, NormativNode, NormativTop } from '../models/normativ.model';

export type GlobalAllocation = {
  items: SupplyItem[];
  grouped: GroupedSupplyItem[];
};

@Injectable({
  providedIn: 'root',
})
export class RawMaterialAllocationService {
  private supplyService = inject(SupplyService);
  private lagerService = inject(LagerService);

  private cached: Promise<GlobalAllocation> | null = null;

  async getGlobalAllocation(): Promise<GlobalAllocation> {
    if (!this.cached) {
      this.cached = this.computeGlobalAllocation();
    }
    return this.cached;
  }

  invalidate() {
    this.cached = null;
  }

  private async computeGlobalAllocation(): Promise<GlobalAllocation> {
    const items = await this.supplyService.findAllItems();

    const uniqueNormativIds = [...new Set(items.map(i => i.normativId).filter(Boolean))];
    const [normatives, customsStock] = await Promise.all([
      Promise.all(uniqueNormativIds.map(id => this.supplyService.findNormativById(id))),
      this.lagerService.getCustomsStock(),
    ]);
    const normativMap = new Map<string, NormativTop>();
    normatives.forEach(n => normativMap.set(n.id, n));

    const normItems = items.flatMap(item => this.processSupplyItem(item, normativMap));
    const groupedMap = this.buildGroupedMap(normItems, customsStock);
    const grouped = Array.from(groupedMap.values());
    this.allocateStock(grouped);

    return { items, grouped };
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
        orderId: item.orderId.id ?? '',
        orderName: item.orderId.customerId.name + ' ' + item.orderId.orderName,
        customerName: item.orderId.customerId.name ?? '',
        deliveryDate: item.orderId.deliveryDate as Date,
        localQuantity: rootKolicinaGP > 0
          ? (totalNeededUnits / rootKolicinaGP) * node.kolicinaZaParentGP
          : 0,
        allocatedQuantity: 0,
      }))
      .filter(normItem => normItem.totalNeededBox > 0);
  }

  private processSupplyItem(item: SupplyItem, normativMap: Map<string, NormativTop>): NormItem[] {
    const normativ = normativMap.get(item.normativId);
    if (!normativ) return [];
    const root = normativ.tree[0] as any;
    const rootKolicinaGP: number = root?.kolicinaGP ?? 1;
    const materialNodes = flattenMaterials((root?.nodes ?? []) as NormativNode[]);
    return this.mapNodesToNormItems(item, materialNodes, rootKolicinaGP);
  }

  private buildGroupedMap(normItems: NormItem[], customsStock: Map<string, number>): Map<string, GroupedSupplyItem> {
    const groupedMap = new Map<string, GroupedSupplyItem>();

    normItems.forEach(normItem => {
      const key = normItem.node.artikalId;
      const existing = groupedMap.get(key);

      if (existing) {
        existing.totalQuantity += normItem.localQuantity;
        const childKey = `${normItem.productCode}|${normItem.orderId}`;
        const existingChild = existing.items.find(
          item => `${item.productCode}|${item.orderId}` === childKey
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
          allocatedQuantity: 0,
          customsQuantity: customsStock.get(key) ?? 0,
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
      group.allocatedQuantity = group.items.reduce((sum, item) => sum + item.allocatedQuantity, 0);
    }
  }
}
