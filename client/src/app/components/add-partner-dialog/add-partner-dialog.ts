import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PartneriService } from '../../services/partneri.service';
import { Partner } from '../../models/partner.model';
import { firstValueFrom } from 'rxjs';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';

export type AddPartnerDialogData = {
  title: string;
};

@Component({
  selector: 'app-add-partner-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [],
  templateUrl: './add-partner-dialog.html',
  styleUrl: './add-partner-dialog.scss',
})
export class AddPartnerDialog {
  partneriService = inject(PartneriService);
  messagesService = inject(MessagesService);
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef);
  data: AddPartnerDialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    sifraPartnera: [''],
    nazivPartnera: [''],
    adresa: [''],
    mesto: [''],
    kategorija: [''],
  });

  async onSave() {
    const props = this.form.value as Partial<Partner>;
    if (!props.sifraPartnera?.trim() || !props.nazivPartnera?.trim()) {
      this.messagesService.showMessage('Šifra i naziv su obavezni.', 'error');
      return;
    }
    try {
      const created = await this.partneriService.create(props);
      this.dialogRef.close(created);
    } catch (error: any) {
      console.error('Error creating partner:', error);
      if (!isHandledAuthError(error)) {
        const message = error?.status === 409
          ? `Partner sa šifrom ${props.sifraPartnera} već postoji.`
          : 'Došlo je do greške prilikom dodavanja partnera. Molimo pokušajte ponovo.';
        this.messagesService.showMessage(message, 'error');
      }
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}

export async function openAddPartnerDialog(dialog: MatDialog, data: AddPartnerDialogData) {
  const config = new MatDialogConfig<AddPartnerDialogData>();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '420px';
  config.data = data;

  const close$ = dialog.open(AddPartnerDialog, config)
    .afterClosed();

  return firstValueFrom(close$);
}
