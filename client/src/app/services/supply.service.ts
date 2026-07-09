import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SupplyItem } from '../models/supply-item.model';
import { NormativTop } from '../models/normativ.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupplyService {
  http = inject(HttpClient);

  async findAllItemsforOrder(orderId: string): Promise<SupplyItem[]> {
    return firstValueFrom(this.http.get<SupplyItem[]>(`/api/supply/${orderId}`));
  }

  async findAllItems(): Promise<SupplyItem[]> {
    return firstValueFrom(this.http.get<SupplyItem[]>(`/api/supply`));
  }

  async findNormativById(normativId: string): Promise<NormativTop> {
    return firstValueFrom(this.http.get<NormativTop>(`/api/normativ-tree/${normativId}`));
  }

  async getRefreshStatus(): Promise<{ lastRefreshedAt: string | null; apiAvailable: boolean }> {
    return firstValueFrom(this.http.get<{ lastRefreshedAt: string | null; apiAvailable: boolean }>('/api/normativ-tree/refresh-status'));
  }
}
