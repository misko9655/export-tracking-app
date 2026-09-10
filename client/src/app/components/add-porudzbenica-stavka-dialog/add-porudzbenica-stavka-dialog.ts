import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AddPorudzbenicaStavkaDialogData } from '../../models/add-porudzbenica-stavka-dialog-data.model';
import { Repromaterijal } from '../../models/repromaterijal.model';
import { firstValueFrom } from 'rxjs';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-add-porudzbenica-stavka-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  providers: [],
  templateUrl: './add-porudzbenica-stavka-dialog.html',
  styleUrl: './add-porudzbenica-stavka-dialog.scss',
})
export class AddPorudzbenicaStavkaDialog {
  messagesService = inject(MessagesService);
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef);
  data: AddPorudzbenicaStavkaDialogData = inject(MAT_DIALOG_DATA);

  artikalSearch = signal('');
  selectedRepromaterijal = signal<Repromaterijal | undefined>(undefined);

  filteredRepromaterijali = computed(() => {
    const q = this.artikalSearch().toLowerCase().trim();
    // Prazno dok se ne ukuca bar jedno slovo - inace se predlozi otvaraju odmah
    // na fokus polja (Material autocomplete otvara panel cim ima opcija).
    if (!q) return [];
    return this.data.repromaterijali
      .filter(r => r.sifraRepromaterijala.toLowerCase().includes(q) || r.nazivRepromaterijala.toLowerCase().includes(q))
      .slice(0, 50);
  });

  form = this.fb.group({
    kolicina: [0],
    cenaPoJm: [0],
  });

  onArtikalInput(value: string) {
    this.artikalSearch.set(value);
    if (this.selectedRepromaterijal() && this.displayRepromaterijal(this.selectedRepromaterijal()) !== value) {
      this.selectedRepromaterijal.set(undefined);
    }
  }

  onArtikalSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedRepromaterijal.set(event.option.value as Repromaterijal);
  }

  displayRepromaterijal(repromaterijal: Repromaterijal | undefined): string {
    return repromaterijal ? `${repromaterijal.sifraRepromaterijala} - ${repromaterijal.nazivRepromaterijala}` : '';
  }

  onSave() {
    const repromaterijal = this.selectedRepromaterijal();
    if (!repromaterijal) {
      this.messagesService.showMessage('Izaberite artikal sa liste.', 'error');
      return;
    }
    const kolicina = this.form.value.kolicina ?? 0;
    if (!kolicina || kolicina <= 0) {
      this.messagesService.showMessage('Unesite validnu količinu.', 'error');
      return;
    }
    const cenaPoJm = this.form.value.cenaPoJm ?? 0;
    if (cenaPoJm < 0) {
      this.messagesService.showMessage('Cena ne može biti negativna.', 'error');
      return;
    }
    this.dialogRef.close({
      artikalId: repromaterijal.sifraRepromaterijala,
      artikalNaziv: repromaterijal.nazivRepromaterijala,
      artikalJm: repromaterijal.jedinicaMere,
      kolicina,
      cenaPoJm,
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}

export async function openAddPorudzbenicaStavkaDialog(dialog: MatDialog, data: AddPorudzbenicaStavkaDialogData) {
  const config = new MatDialogConfig<AddPorudzbenicaStavkaDialogData>();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '420px';
  config.data = data;

  const close$ = dialog.open(AddPorudzbenicaStavkaDialog, config)
    .afterClosed();

  return firstValueFrom(close$);
}
