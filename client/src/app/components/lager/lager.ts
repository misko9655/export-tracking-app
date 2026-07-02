import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { LagerService } from '../../services/lager.service';
import { LagerItem } from '../../models/lager-item.model';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-lager',
  imports: [
    MatTableModule,
    MatSortModule,
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
  private messagesService = inject(MessagesService);

  allItems = signal<LagerItem[]>([]);
  searchQuery = signal('');
  selectedSkladiste = signal('003');

  skladista = ['002', '003', '802', '804', '903', '904'];

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

  dataSource = new MatTableDataSource<LagerItem>();
  sort = viewChild(MatSort);

  constructor() {
    this.loadLager('003');

    effect(() => {
      this.dataSource.data = this.filteredItems();
    });

    effect(() => {
      this.dataSource.sort = this.sort() ?? null;
    });
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
      this.messagesService.showMessage('Greška pri učitavanju lagera. Pokušajte ponovo.', 'error');
      this.allItems.set([]);
    }
  }
}
