import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NormativNode } from '../../models/normativ.model';
import { GroupedSupplyItem } from '../../models/supply-item.model';
import { CommonModule, DatePipe } from '@angular/common';
import { QtyPipe } from '../../pipes/qty.pipe';
import { QtyFormatPipe } from '../../pipes/qty-format.pipe';
import { QtyTooltipPipe } from '../../pipes/qty-tooltip.pipe';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { animate, state, style, transition, trigger } from '@angular/animations';

export type RawMaterialAvailabilityData = {
  nodes: NormativNode[];
  totalOrderedTp: number;
  productName: string;
  productCode: string;
  groupedByArtikal: Map<string, GroupedSupplyItem>;
  orderIds: Set<string>;
};

type OrderAllocation = {
  orderName: string;
  deliveryDate: Date;
  needed: number;
  allocated: number;
};

type RawMaterialRow = {
  artikalId: string;
  artikalNaziv: string;
  artikalJm: string;
  potrebno: number;
  dostupno: number;
  carinskiMagacin: number;
  ok: boolean;
  orderAllocations: OrderAllocation[];
  isExpanded: boolean;
};

@Component({
  selector: 'app-raw-materials-availability-dialog',
  standalone: true,
  imports: [CommonModule, DatePipe, MatDialogModule, MatTableModule, MatIconModule, MatButtonModule, QtyPipe, QtyFormatPipe, QtyTooltipPipe],
  templateUrl: './raw-materials-availability-dialog.html',
  styleUrl: './raw-materials-availability-dialog.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RawMaterialsAvailabilityDialog {
  data = inject<RawMaterialAvailabilityData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<RawMaterialsAvailabilityDialog>);

  displayedColumns = ['expand', 'artikalId', 'artikalNaziv', 'artikalJm', 'potrebno', 'dostupno', 'carinskiMagacin', 'status'];

  rows = signal<RawMaterialRow[]>(this.buildRows());
  allAvailable = computed(() => this.rows().every(r => r.ok));

  private buildRows(): RawMaterialRow[] {
    return this.data.nodes.map(n => {
      const group = this.data.groupedByArtikal.get(n.artikalId);
      const itemsForProduct = (group?.items ?? []).filter(
        i => i.productCode === this.data.productCode && this.data.orderIds.has(i.orderId)
      );

      const orderAllocations: OrderAllocation[] = itemsForProduct
        .map(i => ({
          orderName: i.orderName,
          deliveryDate: i.deliveryDate,
          needed: i.localQuantity,
          allocated: i.allocatedQuantity,
        }))
        .filter(a => a.needed > 0)
        .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

      const potrebno = itemsForProduct.reduce((sum, i) => sum + i.localQuantity, 0);
      const dostupno = n.artikalZaliha;
      const carinskiMagacin = group?.customsQuantity ?? 0;

      return {
        artikalId: n.artikalId,
        artikalNaziv: n.artikalNaziv,
        artikalJm: n.artikalJm,
        potrebno,
        dostupno,
        carinskiMagacin,
        ok: (dostupno + carinskiMagacin) >= potrebno,
        orderAllocations,
        isExpanded: false,
      };
    });
  }

  toggleRow(row: RawMaterialRow) {
    row.isExpanded = !row.isExpanded;
  }
}
