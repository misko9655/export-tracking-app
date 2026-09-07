import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AddPorudzbenicaStavkaDialogData } from '../../models/add-porudzbenica-stavka-dialog-data.model';
import { ArtikalLogistika } from '../../models/artikal-logistika.model';
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
  selectedArtikal = signal<ArtikalLogistika | undefined>(undefined);

  filteredArtikli = computed(() => {
    const q = this.artikalSearch().toLowerCase().trim();
    if (!q) return this.data.artikli.slice(0, 50);
    return this.data.artikli
      .filter(a => a.artikalId.toLowerCase().includes(q) || a.artikalNaziv.toLowerCase().includes(q))
      .slice(0, 50);
  });

  form = this.fb.group({
    kolicina: [0],
  });

  onArtikalInput(value: string) {
    this.artikalSearch.set(value);
    if (this.selectedArtikal() && this.displayArtikal(this.selectedArtikal()) !== value) {
      this.selectedArtikal.set(undefined);
    }
  }

  onArtikalSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedArtikal.set(event.option.value as ArtikalLogistika);
  }

  displayArtikal(artikal: ArtikalLogistika | undefined): string {
    return artikal ? `${artikal.artikalId} - ${artikal.artikalNaziv}` : '';
  }

  onSave() {
    const artikal = this.selectedArtikal();
    if (!artikal) {
      this.messagesService.showMessage('Izaberite artikal sa liste.', 'error');
      return;
    }
    const kolicina = this.form.value.kolicina ?? 0;
    if (!kolicina || kolicina <= 0) {
      this.messagesService.showMessage('Unesite validnu količinu.', 'error');
      return;
    }
    this.dialogRef.close({
      artikalId: artikal.artikalId,
      artikalNaziv: artikal.artikalNaziv,
      artikalJm: artikal.artikalJm,
      kolicina,
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
