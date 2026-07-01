import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  template: `
    <div class="msg-icon">
      <span class="icon-circle">
        @switch(data.severity) {
          @case('error') { ✕ }
          @case('warning') { ⚠ }
          @case('success') { ✓ }
          @case('info') { i }
        }
      </span>
    </div>
    <div class="msg-body">
      <p class="msg-title">
        @switch(data.severity) {
          @case('error') { Greška }
          @case('warning') { Upozorenje }
          @case('success') { Uspešno }
          @case('info') { Informacija }
        }
      </p>
      <p class="msg-text">{{ data.text }}</p>
    </div>
    <button class="msg-close" (click)="close()" aria-label="Zatvori">✕</button>
  `,
  styleUrl: './message-dialog.scss',
})
export class MessageDialog {
  data: Message = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<MessageDialog>);

  close() {
    this.dialogRef.close();
  }
}
