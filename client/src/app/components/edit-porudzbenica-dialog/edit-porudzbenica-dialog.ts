import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PorudzbeniceService } from '../../services/porudzbenice.service';
import { PartneriService } from '../../services/partneri.service';
import { EditPorudzbenicaDialogData } from '../../models/edit-porudzbenica-dialog-data.model';
import { Porudzbenica } from '../../models/porudzbenica.model';
import { Partner } from '../../models/partner.model';
import { firstValueFrom } from 'rxjs';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';

@Component({
  selector: 'app-edit-porudzbenica-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatAutocompleteModule,
  ],
  providers: [],
  templateUrl: './edit-porudzbenica-dialog.html',
  styleUrl: './edit-porudzbenica-dialog.scss',
})
export class EditPorudzbenicaDialog {
  porudzbeniceService = inject(PorudzbeniceService);
  partneriService = inject(PartneriService);
  messagesService = inject(MessagesService);
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef);
  data: EditPorudzbenicaDialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    dobavljac: [''],
    datum: [new Date()],
    napomena: [''],
  });

  // Predlozi za "Dobavljač" - cela kolekcija partnera, bez filtera po kategoriji
  // (vecina uvezenih partnera jos nema kategoriju postavljenu).
  partneri = signal<Partner[]>([]);
  dobavljacSearch = signal('');

  filteredPartneri = computed(() => {
    const q = this.dobavljacSearch().toLowerCase().trim();
    // Prazno dok se ne ukuca bar jedno slovo - inace se predlozi otvaraju odmah
    // na fokus polja (Material autocomplete otvara panel cim ima opcija).
    if (!q) return [];
    const base = this.partneri();
    return base.filter(p => p.nazivPartnera.toLowerCase().includes(q)).slice(0, 20);
  });

  constructor() {
    this.loadPartneri();
  }

  private async loadPartneri() {
    try {
      const partneri = await this.partneriService.findAll();
      this.partneri.set(partneri);
    } catch (error) {
      console.error('Error loading partneri:', error);
    }
  }

  onDobavljacInput(value: string) {
    this.dobavljacSearch.set(value);
  }

  onSave() {
    const props = this.form.value as Partial<Porudzbenica>;
    this.create(props);
  }

  onClose() {
    this.dialogRef.close();
  }

  async create(porudzbenica: Partial<Porudzbenica>) {
    try {
      const created = await this.porudzbeniceService.create(porudzbenica);
      this.dialogRef.close(created);
    }
    catch(error) {
      console.error('Error creating porudzbenica:', error);
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Došlo je do greške prilikom kreiranja porudžbenice. Molimo pokušajte ponovo.', 'error');
      }
    }
  }
}

export async function openEditPorudzbenicaDialog(dialog: MatDialog, data: EditPorudzbenicaDialogData) {
  const config = new MatDialogConfig<EditPorudzbenicaDialogData>();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  config.data = data;

  const close$ = dialog.open(EditPorudzbenicaDialog, config)
    .afterClosed();

  return firstValueFrom(close$);
}
