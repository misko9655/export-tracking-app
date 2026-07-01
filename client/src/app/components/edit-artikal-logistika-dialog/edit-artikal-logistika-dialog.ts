import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ArtikalLogistika } from '../../models/artikal-logistika.model';
import { ArtikliLogistikaService } from '../../services/artikli-logistika.service';
import { MessagesService } from '../../services/messages.service';

@Component({
    selector: 'app-edit-artikal-logistika-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
    templateUrl: './edit-artikal-logistika-dialog.html',
    styleUrl: './edit-artikal-logistika-dialog.scss',
})
export class EditArtikalLogistikaDialog {
    fb = inject(FormBuilder);
    dialogRef = inject(MatDialogRef<EditArtikalLogistikaDialog>);
    data: ArtikalLogistika = inject(MAT_DIALOG_DATA);
    service = inject(ArtikliLogistikaService);
    messagesService = inject(MessagesService);

    form = this.fb.group({
        paketaNapaleti: [this.data.paketaNapaleti ?? 0],
        visinaJed: [this.data.visinaJed ?? 0],
        sirinaJed: [this.data.sirinaJed ?? 0],
        dubinaJed: [this.data.dubinaJed ?? 0],
        nettoTezinaJed: [this.data.nettoTezinaJed ?? 0],
        bruttoTezinaJed: [this.data.bruttoTezinaJed ?? 0],
        visinaTP: [this.data.visinaTP ?? 0],
        sirinaTP: [this.data.sirinaTP ?? 0],
        dubinaTP: [this.data.dubinaTP ?? 0],
        nettoTezinaTP: [this.data.nettoTezinaTP ?? 0],
        bruttoTezinaTP: [this.data.bruttoTezinaTP ?? 0],
    });

    async onSave() {
        try {
            const updated = await this.service.update(this.data.artikalId, this.form.value as Partial<ArtikalLogistika>);
            this.dialogRef.close(updated);
        } catch (err) {
            console.error('Greška pri čuvanju:', err);
            this.messagesService.showMessage('Greška pri čuvanju logističkih podataka. Pokušajte ponovo.', 'error');
        }
    }

    onClose() {
        this.dialogRef.close();
    }
}

export async function openEditArtikalLogistikaDialog(dialog: MatDialog, artikal: ArtikalLogistika): Promise<ArtikalLogistika | undefined> {
    const config = new MatDialogConfig<ArtikalLogistika>();
    config.disableClose = true;
    config.autoFocus = true;
    config.width = '560px';
    config.data = artikal;
    const close$ = dialog.open(EditArtikalLogistikaDialog, config).afterClosed();
    return firstValueFrom(close$);
}
