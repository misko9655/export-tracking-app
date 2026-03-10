import { Component, computed, inject, model, signal } from '@angular/core';
import { OrderItem } from '../../models/order-item.model';
import { ProductionService } from '../../services/production.service';
import { ProductionItem } from '../../models/production-item.model';
import { ProductionItemsTable } from '../production-items-table/production-items-table';
import { LoadingService } from '../../services/loading.service';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-production',
  imports: [
    ProductionItemsTable,
    MatSelectModule,
    CommonModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './production.html',
  styleUrl: './production.scss',
})
export class Production {
  #productionItems = signal<ProductionItem[]>([]);
  productionService = inject(ProductionService);

  loadingService = inject(LoadingService);

  selected = model('all');

  customers = computed(() => {
    const newCustomers = this.#productionItems().map(item => item.orderId.customerId.name);
    return [...new Set(newCustomers)];
  });

  productionItemsForDisplay = computed(() => {
    if(this.selected() === 'all') {
      return [...this.#productionItems()];
    } else {
      return [...this.#productionItems().filter(item => item.orderId.customerId.name === this.selected())]
    }
  });

  constructor() {
    this.loadProductionItems()
      .then(() => console.log('Order items load successfully', this.#productionItems()));
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
}
