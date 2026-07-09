import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService, DashboardStats, DashboardUser } from '../../services/dashboard.service';
import { OrderItemsService } from '../../services/order-items.service';
import { MessagesService } from '../../services/messages.service';

const AVAILABLE_ROLES = ['ADMIN', 'EXPORT', 'SUPPLY', 'PRODUCTION', 'MATERIALS', 'MGP', 'VIEWER', 'SUPER_ADMIN'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private orderItemsService = inject(OrderItemsService);
  private messagesService = inject(MessagesService);
  private fb = inject(FormBuilder);

  availableRoles = AVAILABLE_ROLES;
  stats = signal<DashboardStats | null>(null);
  users = signal<DashboardUser[]>([]);
  userColumns = ['username', 'roles'];
  loading = signal(true);
  updatingLogistics = signal(false);

  userForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['EXPORT', Validators.required],
  });

  constructor() {
    this.loadAll();
  }

  async loadAll() {
    this.loading.set(true);
    try {
      const [stats, users] = await Promise.all([
        this.dashboardService.getStats(),
        this.dashboardService.getUsers(),
      ]);
      this.stats.set(stats);
      this.users.set(users);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.messagesService.showMessage('Greška pri učitavanju dashboard podataka.', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async onCreateUser() {
    if (this.userForm.invalid) return;
    const { username, password, role } = this.userForm.value;
    try {
      await this.dashboardService.createUser(username!, password!, [role!]);
      this.messagesService.showMessage(`Korisnik "${username}" je uspešno kreiran.`, 'success');
      this.userForm.reset({ role: 'EXPORT' });
      await this.loadAll();
    } catch (error: any) {
      console.error('Error creating user:', error);
      const msg = error?.error?.message ?? 'Greška pri kreiranju korisnika.';
      this.messagesService.showMessage(msg, 'error');
    }
  }

  async onUpdateLogistics() {
    this.updatingLogistics.set(true);
    try {
      const result = await this.orderItemsService.updateLogistics();
      this.messagesService.showMessage(`Ažurirano ${result.updated} od ${result.total} stavki.`, 'success');
    } catch (error) {
      console.error('Error updating logistics:', error);
      this.messagesService.showMessage('Greška pri ažuriranju logistike.', 'error');
    } finally {
      this.updatingLogistics.set(false);
    }
  }
}
