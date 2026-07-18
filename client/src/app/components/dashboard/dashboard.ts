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
import { MatDialog } from '@angular/material/dialog';
import { DashboardService, DashboardStats, DashboardUser } from '../../services/dashboard.service';
import { OrderItemsService } from '../../services/order-items.service';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';
import { openEditPermissionsDialog } from '../edit-permissions-dialog/edit-permissions-dialog';
import { NotificationEmail, NotificationEmailsService } from '../../services/notification-emails.service';

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
  private notificationEmailsService = inject(NotificationEmailsService);
  private messagesService = inject(MessagesService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  availableRoles = AVAILABLE_ROLES;
  stats = signal<DashboardStats | null>(null);
  users = signal<DashboardUser[]>([]);
  userColumns = ['username', 'roles', 'permissions'];
  loading = signal(true);
  updatingLogistics = signal(false);

  notificationEmails = signal<NotificationEmail[]>([]);
  addingEmail = signal(false);

  userForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['EXPORT', Validators.required],
  });

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.loadAll();
  }

  async loadAll() {
    this.loading.set(true);
    try {
      const [stats, users, notificationEmails] = await Promise.all([
        this.dashboardService.getStats(),
        this.dashboardService.getUsers(),
        this.notificationEmailsService.getAll(),
      ]);
      this.stats.set(stats);
      this.users.set(users);
      this.notificationEmails.set(notificationEmails);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Greška pri učitavanju dashboard podataka.', 'error');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async onAddNotificationEmail() {
    if (this.emailForm.invalid) return;
    const email = this.emailForm.value.email!;
    this.addingEmail.set(true);
    try {
      const created = await this.notificationEmailsService.add(email);
      this.notificationEmails.update(emails => [...emails, created]);
      this.emailForm.reset();
      this.messagesService.showMessage(`Email "${email}" je dodat na listu obaveštenja.`, 'success');
    } catch (error: any) {
      console.error('Error adding notification email:', error);
      if (!isHandledAuthError(error)) {
        const msg = error?.error?.message ?? 'Greška pri dodavanju email adrese.';
        this.messagesService.showMessage(msg, 'error');
      }
    } finally {
      this.addingEmail.set(false);
    }
  }

  async onRemoveNotificationEmail(item: NotificationEmail) {
    try {
      await this.notificationEmailsService.remove(item._id);
      this.notificationEmails.update(emails => emails.filter(e => e._id !== item._id));
    } catch (error) {
      console.error('Error removing notification email:', error);
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Greška pri uklanjanju email adrese.', 'error');
      }
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
      if (!isHandledAuthError(error)) {
        const msg = error?.error?.message ?? 'Greška pri kreiranju korisnika.';
        this.messagesService.showMessage(msg, 'error');
      }
    }
  }

  async onEditPermissions(user: DashboardUser) {
    const updated = await openEditPermissionsDialog(this.dialog, user);
    if (updated) {
      this.users.update(users => users.map(u => (u.username === updated.username ? updated : u)));
    }
  }

  async onUpdateLogistics() {
    this.updatingLogistics.set(true);
    try {
      const result = await this.orderItemsService.updateLogistics();
      this.messagesService.showMessage(`Ažurirano ${result.updated} od ${result.total} stavki.`, 'success');
    } catch (error) {
      console.error('Error updating logistics:', error);
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Greška pri ažuriranju logistike.', 'error');
      }
    } finally {
      this.updatingLogistics.set(false);
    }
  }
}
