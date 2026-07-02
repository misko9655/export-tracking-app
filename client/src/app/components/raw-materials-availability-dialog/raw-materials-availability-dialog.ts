import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NormativNode } from '../../models/normativ.model';
import { ProductionItem } from '../../models/production-item.model';
import { CommonModule, DatePipe } from '@angular/common';
import { QtyPipe } from '../../pipes/qty.pipe';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LagerService } from '../../services/lager.service';

export type RawMaterialAvailabilityData = {
  nodes: NormativNode[];
  totalOrderedTp: number;
  unitsInTransportBox: number;
  rootKolicinaGP: number;
  productName: string;
  productCode: string;
  items: ProductionItem[];
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
  imports: [CommonModule, DatePipe, MatDialogModule, MatTableModule, MatIconModule, MatButtonModule, QtyPipe],
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
  private lagerService = inject(LagerService);

  displayedColumns = ['expand', 'artikalId', 'artikalNaziv', 'artikalJm', 'potrebno', 'dostupno', 'carinskiMagacin', 'status'];

  rows = signal<RawMaterialRow[]>([]);
  allAvailable = computed(() => this.rows().every(r => r.ok));

  constructor() {
    this.loadRows();
  }

  private async loadRows() {
    const customsStock = await this.lagerService.getCustomsStock();

    const rows: RawMaterialRow[] = this.data.nodes.map(n => {
      const factor = this.data.rootKolicinaGP > 0
        ? this.data.unitsInTransportBox / this.data.rootKolicinaGP
        : 0;

      const allocations: OrderAllocation[] = this.data.items
        .map(item => {
          const neededTp = item.numberOfOrderedTp - item.numberOfReadyTp;
          return {
            orderName: `${(item.orderId.customerId as any)?.name ?? ''} ${item.orderId.orderName ?? ''}`.trim(),
            deliveryDate: item.orderId.deliveryDate as Date,
            needed: neededTp * factor * n.kolicinaZaParentGP,
            allocated: 0,
          };
        })
        .filter(a => a.needed > 0)
        .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

      let remaining = n.artikalZaliha;
      for (const alloc of allocations) {
        alloc.allocated = Math.min(remaining, alloc.needed);
        remaining = Math.max(0, remaining - alloc.needed);
      }

      const potrebno = this.data.rootKolicinaGP > 0
        ? (this.data.totalOrderedTp * this.data.unitsInTransportBox / this.data.rootKolicinaGP) * n.kolicinaZaParentGP
        : 0;

      return {
        artikalId: n.artikalId,
        artikalNaziv: n.artikalNaziv,
        artikalJm: n.artikalJm,
        potrebno,
        dostupno: n.artikalZaliha,
        carinskiMagacin: customsStock.get(n.artikalId) ?? 0,
        ok: n.artikalZaliha >= potrebno,
        orderAllocations: allocations,
        isExpanded: false,
      };
    });

    this.rows.set(rows);
  }

  toggleRow(row: RawMaterialRow) {
    row.isExpanded = !row.isExpanded;
  }
}
