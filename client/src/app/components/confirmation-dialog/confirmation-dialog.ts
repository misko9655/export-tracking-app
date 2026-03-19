import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogData } from '../../models/confirmation-dialog-data.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {

  dialogRef = inject(MatDialogRef);
  data: ConfirmationDialogData = inject(MAT_DIALOG_DATA);

  onClose() {
    this.dialogRef.close();
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}

export async function openConfirmationDialog(dialog: MatDialog, data: ConfirmationDialogData) {
  const config = new MatDialogConfig<ConfirmationDialogData>();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  config.data = data;

  const close$ = dialog.open(ConfirmationDialog, config)
    .afterClosed();

  return firstValueFrom(close$);
}
