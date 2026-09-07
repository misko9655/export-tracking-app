import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Repromaterijal } from '../../models/repromaterijal.model';
import { RepromaterijaliService } from '../../services/repromaterijali.service';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';

@Component({
    selector: 'app-edit-repromaterijal-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
    templateUrl: './edit-repromaterijal-dialog.html',
    styleUrl: './edit-repromaterijal-dialog.scss',
})
export class EditRepromaterijalDialog {
    fb = inject(FormBuilder);
    dialogRef = inject(MatDialogRef<EditRepromaterijalDialog>);
    data: Repromaterijal = inject(MAT_DIALOG_DATA);
    service = inject(RepromaterijaliService);
    messagesService = inject(MessagesService);

    form = this.fb.group({
        nazivRepromaterijala: [this.data.nazivRepromaterijala ?? ''],
        jedinicaMere: [this.data.jedinicaMere ?? ''],
        tipRepromaterijala: [this.data.tipRepromaterijala],
    });

    async onSave() {
        try {
            const updated = await this.service.update(this.data.sifraRepromaterijala, this.form.value as Partial<Repromaterijal>);
            this.dialogRef.close(updated);
        } catch (err) {
            console.error('Greška pri čuvanju:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri čuvanju repromaterijala. Pokušajte ponovo.', 'error');
            }
        }
    }

    onClose() {
        this.dialogRef.close();
    }
}

export async function openEditRepromaterijalDialog(dialog: MatDialog, repromaterijal: Repromaterijal): Promise<Repromaterijal | undefined> {
    const config = new MatDialogConfig<Repromaterijal>();
    config.disableClose = true;
    config.autoFocus = true;
    config.width = '440px';
    config.data = repromaterijal;
    const close$ = dialog.open(EditRepromaterijalDialog, config).afterClosed();
    return firstValueFrom(close$);
}
