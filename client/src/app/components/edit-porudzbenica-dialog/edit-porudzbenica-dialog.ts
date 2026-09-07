import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PorudzbeniceService } from '../../services/porudzbenice.service';
import { EditPorudzbenicaDialogData } from '../../models/edit-porudzbenica-dialog-data.model';
import { Porudzbenica } from '../../models/porudzbenica.model';
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
  ],
  providers: [],
  templateUrl: './edit-porudzbenica-dialog.html',
  styleUrl: './edit-porudzbenica-dialog.scss',
})
export class EditPorudzbenicaDialog {
  porudzbeniceService = inject(PorudzbeniceService);
  messagesService = inject(MessagesService);
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef);
  data: EditPorudzbenicaDialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    dobavljac: [''],
    datum: [new Date()],
    napomena: [''],
  });

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
