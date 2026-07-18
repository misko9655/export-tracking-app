import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type NotificationEmail = {
  _id: string;
  email: string;
};

@Injectable({
  providedIn: 'root',
})
export class NotificationEmailsService {
  http = inject(HttpClient);

  async getAll(): Promise<NotificationEmail[]> {
    return firstValueFrom(this.http.get<NotificationEmail[]>('/api/dashboard/notification-emails'));
  }

  async add(email: string): Promise<NotificationEmail> {
    return firstValueFrom(this.http.post<NotificationEmail>('/api/dashboard/notification-emails', { email }));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`/api/dashboard/notification-emails/${id}`));
  }
}
