import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { RealtimeService } from '../../services/realtime.service';
import { PorudzbeniceService } from '../../services/porudzbenice.service';
import { Porudzbenica } from '../../models/porudzbenica.model';
import { openEditPorudzbenicaDialog } from '../edit-porudzbenica-dialog/edit-porudzbenica-dialog';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';

@Component({
    selector: 'app-nabavka-porudzbenice',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './nabavka-porudzbenice.html',
    styleUrl: './nabavka-porudzbenice.scss',
})
export class NabavkaPorudzbenice {
    private service = inject(PorudzbeniceService);
    private dialog = inject(MatDialog);
    private router = inject(Router);
    private messagesService = inject(MessagesService);
    private realtimeService = inject(RealtimeService);
    private destroyRef = inject(DestroyRef);

    porudzbenice = signal<Porudzbenica[]>([]);

    displayedColumns = ['brojPorudzbenice', 'dobavljac', 'datum', 'status', 'brojStavki'];

    statusLabels: Record<string, string> = {
        kreirana: 'Kreirana',
        poslata: 'Poslata',
        realizovana: 'Realizovana',
    };

    constructor() {
        this.load();

        this.realtimeService.onDataChanged('porudzbenica')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.load());
    }

    private async load() {
        try {
            const items = await this.service.findAll();
            this.porudzbenice.set(items);
        } catch (err) {
            console.error('Greška pri učitavanju porudžbenica:', err);
            if (!isHandledAuthError(err)) {
                this.messagesService.showMessage('Greška pri učitavanju porudžbenica. Pokušajte ponovo.', 'error');
            }
        }
    }

    openDetails(porudzbenica: Porudzbenica) {
        this.router.navigate(['/nabavka-porudzbine', porudzbenica.id]);
    }

    async onNewPorudzbenica() {
        const created = await openEditPorudzbenicaDialog(this.dialog, { title: 'Nova porudžbenica' });
        if (created) {
            this.router.navigate(['/nabavka-porudzbine', created.id]);
        }
    }
}
