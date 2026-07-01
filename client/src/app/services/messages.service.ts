import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageSeverity } from '../models/message.model';
import { MessageDialog } from '../components/messages/message-dialog';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private dialog = inject(MatDialog);
  private dialogRef: MatDialogRef<MessageDialog> | null = null;

  showMessage(text: string, severity: MessageSeverity) {
    this.dialogRef?.close();
    this.dialogRef = this.dialog.open(MessageDialog, {
      data: { text, severity },
      panelClass: ['msg-panel', `msg-panel-${severity}`],
      disableClose: false,
      maxWidth: '520px',
      width: '480px',
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
    });
  }

  clear() {
    this.dialogRef?.close();
    this.dialogRef = null;
  }
}
