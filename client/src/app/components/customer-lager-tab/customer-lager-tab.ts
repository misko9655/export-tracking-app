import { Component, DestroyRef, inject, input, signal, viewChild, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Order } from '../../models/order.model';
import { OrderItemsService } from '../../services/order-items.service';
import { RealtimeService } from '../../services/realtime.service';

type CustomerLagerRow = {
    productCode: string;
    productName: string;
    totalReadyTp: number;
};

@Component({
    selector: 'app-customer-lager-tab',
    standalone: true,
    imports: [MatTableModule, MatSortModule, MatProgressSpinnerModule, MatIconModule, MatFormFieldModule, MatInputModule, DecimalPipe],
    templateUrl: './customer-lager-tab.html',
    styleUrl: './customer-lager-tab.scss',
})
export class CustomerLagerTab {
    private orderItemsService = inject(OrderItemsService);
    private realtimeService = inject(RealtimeService);
    private destroyRef = inject(DestroyRef);

    orders = input.required<Order[]>();

    loading = signal(false);
    dataSource = new MatTableDataSource<CustomerLagerRow>([]);
    displayedColumns = ['productCode', 'productName', 'totalReadyTp'];
    sort = viewChild(MatSort);
    searchText = signal('');

    constructor() {
        this.dataSource.filterPredicate = (row: CustomerLagerRow, filter: string): boolean => {
            const filterValue = filter.trim().toLowerCase();
            return !filterValue ||
                row.productCode.toLowerCase().includes(filterValue) ||
                row.productName.toLowerCase().includes(filterValue);
        };

        effect(() => {
            this.dataSource.sort = this.sort() ?? null;
        });

        effect(() => {
            this.dataSource.filter = this.searchText().trim().toLowerCase();
        });

        effect(() => {
            this.loadRows(this.orders());
        });

        // 'order-item' promene (npr. odvajanje TP na order-details strani) ne menjaju listu
        // trebovanja koja se prosleđuje ovde, pa je potrebna sopstvena pretplata da se zbir
        // ponovo izračuna kad se izmeni bilo koja stavka.
        this.realtimeService.onDataChanged('order-item')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.loadRows(this.orders()));
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.searchText.set(filterValue);
    }

    private async loadRows(orders: Order[]) {
        if (orders.length === 0) {
            this.dataSource.data = [];
            return;
        }
        this.loading.set(true);
        try {
            const itemsPerOrder = await Promise.all(
                orders.map(o => this.orderItemsService.loadAllOrderItems(o.id))
            );
            const allItems = itemsPerOrder.flat();

            const grouped = new Map<string, CustomerLagerRow>();
            for (const item of allItems) {
                const ready = item.numberOfReadyTp ?? 0;
                if (ready <= 0) continue;
                const existing = grouped.get(item.productCode);
                if (existing) {
                    existing.totalReadyTp += ready;
                } else {
                    grouped.set(item.productCode, {
                        productCode: item.productCode,
                        productName: item.productName,
                        totalReadyTp: ready,
                    });
                }
            }
            this.dataSource.data = Array.from(grouped.values());
        } finally {
            this.loading.set(false);
        }
    }
}
