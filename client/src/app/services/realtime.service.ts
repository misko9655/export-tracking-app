import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export type DataChangedEvent = {
  entity: string;
  action: 'created' | 'updated' | 'deleted';
  [key: string]: any;
};

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) {
      return;
    }
    const token = localStorage.getItem('jwt');
    if (!token) {
      return;
    }
    this.socket = io({ auth: { token } });
    this.socket.on('connect', () => console.log('[Realtime] Connected:', this.socket?.id));
    this.socket.on('connect_error', (err) => console.error('[Realtime] Connection error:', err.message));
    this.socket.on('disconnect', (reason) => console.warn('[Realtime] Disconnected:', reason));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  onDataChanged(entity?: string): Observable<DataChangedEvent> {
    if (!this.socket) {
      this.connect();
    }
    return new Observable<DataChangedEvent>(observer => {
      const handler = (event: DataChangedEvent) => {
        if (!entity || event.entity === entity) {
          observer.next(event);
        }
      };
      this.socket!.on('data-changed', handler);
      return () => {
        this.socket?.off('data-changed', handler);
      };
    });
  }
}
