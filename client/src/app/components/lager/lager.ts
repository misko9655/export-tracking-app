import { Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { LagerService } from '../../services/lager.service';
import { LagerItem } from '../../models/lager-item.model';

@Component({
  selector: 'app-lager',
  imports: [
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    DecimalPipe,
  ],
  templateUrl: './lager.html',
  styleUrl: './lager.scss',
})
export class Lager {
  private lagerService = inject(LagerService);

  allItems = signal<LagerItem[]>([]);
  searchQuery = signal('');
  selectedSkladiste = signal('003');

  skladista = ['002', '003', '903', '904'];

  displayedColumns = ['artikalId', 'skladisteId', 'kolicina', 'naruceno', 'rezervisano'];

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allItems();
    return this.allItems().filter(item =>
      item.artikalId.toLowerCase().includes(query)
    );
  });

  negativeCount = computed(() =>
    this.allItems().filter(i => i.kolicina < 0).length
  );

  constructor() {
    this.loadLager('003');
  }

  async onSkladisteChange(skladisteId: string) {
    this.selectedSkladiste.set(skladisteId);
    await this.loadLager(skladisteId);
  }

  async loadLager(skladisteId: string) {
    try {
      const items = await this.lagerService.findAll(skladisteId);
      this.allItems.set(items ?? []);
    } catch (error) {
      console.error('Greška pri učitavanju lagera:', error);
      this.allItems.set([]);
    }
  }
}
