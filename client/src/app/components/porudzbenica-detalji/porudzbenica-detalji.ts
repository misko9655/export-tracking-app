import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { RealtimeService } from '../../services/realtime.service';
import { PorudzbeniceService } from '../../services/porudzbenice.service';
import { RepromaterijaliService } from '../../services/repromaterijali.service';
import { Porudzbenica, PorudzbenicaStavka } from '../../models/porudzbenica.model';
import { Repromaterijal } from '../../models/repromaterijal.model';
import { openAddPorudzbenicaStavkaDialog } from '../add-porudzbenica-stavka-dialog/add-porudzbenica-stavka-dialog';
import { openConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';

@Component({
  selector: 'app-porudzbenica-detalji',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
  ],
  providers: [],
  templateUrl: './porudzbenica-detalji.html',
  styleUrl: './porudzbenica-detalji.scss',
})
export class PorudzbenicaDetalji {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PorudzbeniceService);
  private repromaterijaliService = inject(RepromaterijaliService);
  private dialog = inject(MatDialog);
  private messagesService = inject(MessagesService);
  private realtimeService = inject(RealtimeService);
  private destroyRef = inject(DestroyRef);

  porudzbenicaId = signal<string>(this.route.snapshot.params['id']);
  porudzbenica = signal<Porudzbenica | null>(null);

  // Pretraga artikala za porudžbenicu ide iz kolekcije repromaterijali (već
  // ograničena isključivo na sirovine i ambalažu, magacini 002/004) umesto iz
  // artikli-logistika - nema potrebe za dodatnim filtriranjem po prefiksu ovde.
  repromaterijali = signal<Repromaterijal[]>([]);

  displayedColumns = ['artikalId', 'artikalNaziv', 'artikalJm', 'kolicina', 'cenaPoJm', 'vrednost', 'actions'];

  vrednostStavke(stavka: PorudzbenicaStavka): number {
    return (stavka.kolicina || 0) * (stavka.cenaPoJm || 0);
  }

  ukupnaVrednost(): number {
    return (this.porudzbenica()?.stavke ?? []).reduce((sum, s) => sum + this.vrednostStavke(s), 0);
  }

  statusLabels: Record<string, string> = {
    kreirana: 'Kreirana',
    poslata: 'Poslata',
    realizovana: 'Realizovana',
  };

  statusFlow: Record<string, Porudzbenica['status'] | null> = {
    kreirana: 'poslata',
    poslata: 'realizovana',
    realizovana: null,
  };

  nextStatusLabel: Record<string, string> = {
    kreirana: 'Označi kao poslata',
    poslata: 'Označi kao realizovana',
    realizovana: '',
  };

  constructor() {
    this.load();
    this.loadRepromaterijali();

    this.realtimeService.onDataChanged('porudzbenica')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }

  private async load() {
    try {
      const porudzbenica = await this.service.findOne(this.porudzbenicaId());
      this.porudzbenica.set(porudzbenica);
    } catch (err) {
      console.error('Greška pri učitavanju porudžbenice:', err);
      if (!isHandledAuthError(err)) {
        this.messagesService.showMessage('Greška pri učitavanju porudžbenice. Pokušajte ponovo.', 'error');
      }
    }
  }

  private async loadRepromaterijali() {
    try {
      const items = await this.repromaterijaliService.findAll();
      this.repromaterijali.set(items);
    } catch (err) {
      console.error('Greška pri učitavanju repromaterijala:', err);
      if (!isHandledAuthError(err)) {
        this.messagesService.showMessage('Greška pri učitavanju repromaterijala. Pokušajte ponovo.', 'error');
      }
    }
  }

  async addStavka() {
    const result = await openAddPorudzbenicaStavkaDialog(this.dialog, {
      title: 'Dodaj artikal',
      repromaterijali: this.repromaterijali(),
    });
    if (!result) return;

    try {
      const updated = await this.service.addStavka(this.porudzbenicaId(), result);
      this.porudzbenica.set(updated);
    } catch (err) {
      console.error('Greška pri dodavanju stavke:', err);
      if (!isHandledAuthError(err)) {
        this.messagesService.showMessage('Greška pri dodavanju artikla. Pokušajte ponovo.', 'error');
      }
    }
  }

  async removeStavka(stavka: PorudzbenicaStavka) {
    const confirmation = await openConfirmationDialog(this.dialog, {
      title: 'Potvrdi brisanje',
      message: `Da li ste sigurni da želite da uklonite artikal ${stavka.artikalId} - ${stavka.artikalNaziv}?`,
    });
    if (!confirmation) return;

    try {
      const updated = await this.service.removeStavka(this.porudzbenicaId(), stavka._id);
      this.porudzbenica.set(updated);
    } catch (err) {
      console.error('Greška pri uklanjanju stavke:', err);
      if (!isHandledAuthError(err)) {
        this.messagesService.showMessage('Greška pri uklanjanju artikla. Pokušajte ponovo.', 'error');
      }
    }
  }

  async advanceStatus() {
    const current = this.porudzbenica();
    if (!current) return;
    const next = this.statusFlow[current.status];
    if (!next) return;

    try {
      const updated = await this.service.updateStatus(this.porudzbenicaId(), next);
      this.porudzbenica.set(updated);
    } catch (err) {
      console.error('Greška pri promeni statusa:', err);
      if (!isHandledAuthError(err)) {
        this.messagesService.showMessage('Greška pri promeni statusa. Pokušajte ponovo.', 'error');
      }
    }
  }

  goBack() {
    this.router.navigate(['/nabavka-porudzbine']);
  }
}
