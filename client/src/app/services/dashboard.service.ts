import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PagePermission } from '../models/user.model';

export type DashboardStats = {
  customersCount: number;
  activeOrdersCount: number;
  deliveredOrdersCount: number;
  orderItemsCount: number;
  erpAvailable: boolean;
  lastRefreshedAt: string | null;
};

export type DashboardUser = {
  username: string;
  roles: string[];
  pagePermissions?: Record<string, PagePermission> | null;
};

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  http = inject(HttpClient);

  async getStats(): Promise<DashboardStats> {
    return firstValueFrom(this.http.get<DashboardStats>('/api/dashboard/stats'));
  }

  async getUsers(): Promise<DashboardUser[]> {
    return firstValueFrom(this.http.get<DashboardUser[]>('/api/dashboard/users'));
  }

  async createUser(username: string, password: string, roles: string[]): Promise<DashboardUser> {
    return firstValueFrom(
      this.http.post<DashboardUser>('/api/login/create', { username, password, roles })
    );
  }

  async updatePermissions(username: string, pagePermissions: Record<string, PagePermission> | null): Promise<DashboardUser> {
    return firstValueFrom(
      this.http.patch<DashboardUser>(`/api/dashboard/users/${username}/permissions`, { pagePermissions })
    );
  }
}
