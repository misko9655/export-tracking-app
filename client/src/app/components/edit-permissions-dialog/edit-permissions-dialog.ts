import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { firstValueFrom } from 'rxjs';
import { DashboardService, DashboardUser } from '../../services/dashboard.service';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';
import { PagePermission } from '../../models/user.model';

const PAGES: { key: string; label: string }[] = [
    { key: 'customers', label: 'Export - Trebovanja' },
    { key: 'production', label: 'Proizvodnja' },
    { key: 'supply', label: 'Nabavka' },
    { key: 'lager', label: 'Lager' },
    { key: 'artikliLogistika', label: 'Artikli - logistika' },
];

@Component({
    selector: 'app-edit-permissions-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule],
    templateUrl: './edit-permissions-dialog.html',
    styleUrl: './edit-permissions-dialog.scss',
})
export class EditPermissionsDialog {
    dialogRef = inject(MatDialogRef<EditPermissionsDialog>);
    data: DashboardUser = inject(MAT_DIALOG_DATA);
    dashboardService = inject(DashboardService);
    messagesService = inject(MessagesService);

    pages = PAGES;
    saving = signal(false);

    permissions = signal<Record<string, PagePermission>>(
        Object.fromEntries(
            PAGES.map(p => [p.key, this.data.pagePermissions?.[p.key] ?? { view: true, edit: true }])
        )
    );

    isCustomized(): boolean {
        return !!this.data.pagePermissions;
    }

    toggle(pageKey: string, field: 'view' | 'edit', checked: boolean) {
        this.permissions.update(current => {
            const page = { ...current[pageKey], [field]: checked };
            if (field === 'view' && !checked) page.edit = false;
            if (field === 'edit' && checked) page.view = true;
            return { ...current, [pageKey]: page };
        });
    }

    async onSave() {
        this.saving.set(true);
        try {
            const updated = await this.dashboardService.updatePermissions(this.data.username, this.permissions());
            this.messagesService.showMessage(`Dozvole za korisnika "${this.data.username}" su ažurirane.`, 'success');
            this.dialogRef.close(updated);
        } catch (err) {
            console.error('Greška pri čuvanju dozvola:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri čuvanju dozvola.', 'error');
            }
        } finally {
            this.saving.set(false);
        }
    }

    async onResetToDefault() {
        this.saving.set(true);
        try {
            const updated = await this.dashboardService.updatePermissions(this.data.username, null);
            this.messagesService.showMessage(`Korisnik "${this.data.username}" je vraćen na podrazumevana prava po ulozi.`, 'success');
            this.dialogRef.close(updated);
        } catch (err) {
            console.error('Greška pri vraćanju dozvola:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri vraćanju dozvola.', 'error');
            }
        } finally {
            this.saving.set(false);
        }
    }

    onClose() {
        this.dialogRef.close();
    }
}

export async function openEditPermissionsDialog(dialog: MatDialog, user: DashboardUser): Promise<DashboardUser | undefined> {
    const config = new MatDialogConfig<DashboardUser>();
    config.disableClose = true;
    config.autoFocus = false;
    config.width = '520px';
    config.data = user;
    const close$ = dialog.open(EditPermissionsDialog, config).afterClosed();
    return firstValueFrom(close$);
}
