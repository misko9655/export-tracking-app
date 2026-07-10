import { computed, inject, Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TokenFromJWT, User } from '../models/user.model';
import { Router } from '@angular/router';
import { RealtimeService } from './realtime.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #userSignal = signal<User | null>(null);
  user = this.#userSignal.asReadonly();
  http = inject(HttpClient);
  router = inject(Router);
  realtimeService = inject(RealtimeService);

  constructor() {
    // Initialize from localStorage once when service starts
    this.loadUserFromStorage();
    if (this.isLoggedIn()) {
      this.realtimeService.connect();
    }

    // Optional: Sync to localStorage when user changes
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('user');
      }
    });
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('jwt');
    if (token && this.isTokenExpired(token)) {
      localStorage.removeItem('user');
      localStorage.removeItem('jwt');
      return;
    }
    const stringUser = localStorage.getItem('user');
    if (stringUser) {
      try {
        const user = JSON.parse(stringUser);
        this.#userSignal.set(user);
      } catch (error) {
        console.error('Failed to parse user', error);
        this.#userSignal.set(null);
      }
    }
  }

  async login(username: string, password: string): Promise<TokenFromJWT> {
    const login$ = this.http.post('/api/login', { username, password });
    const token: any = await firstValueFrom(login$);
    
    if (token.user) {
      this.#userSignal.set(token.user);
      localStorage.setItem('user', JSON.stringify(token.user)); // Save to storage
        localStorage.setItem('jwt', token.authJwtToken);
      this.realtimeService.connect();
    }

    return token;
  }

  logout() {
    this.#userSignal.set(null);
    localStorage.removeItem('user'); // Clear from storage
    localStorage.removeItem('jwt');
    this.realtimeService.disconnect();
    this.router.navigate(['/login']);

  }

  // ✅ Fixed: Pure computed that just reads the signal
  isLoggedIn = computed(() => {
    return this.user() !== null;
  });

  /** Primarna uloga korisnika, sa SUPER_ADMIN tretiranim kao ADMIN za potrebe UI provera
   *  (dugmad/opcije vezane za ulogu) — super admin treba da vidi sve što i admin vidi. */
  effectiveRole = computed(() => {
    const role = this.user()?.roles[0] ?? null;
    return role === 'SUPER_ADMIN' ? 'ADMIN' : role;
  });
}