import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, UserSummary } from '../models/auth.models';

const TOKEN_KEY = 'inklink_token';
const EXPIRES_KEY = 'inklink_token_expires';
const USER_KEY = 'inklink_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly userSignal = signal<UserSummary | null>(this.restoreUser());

  readonly currentUser = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((response) => this.storeSession(response)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (this.isTokenExpired()) {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  private storeSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(EXPIRES_KEY, response.expiresAt);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.userSignal.set(response.user);
  }

  private restoreUser(): UserSummary | null {
    if (this.isTokenExpired()) {
      return null;
    }
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserSummary;
    } catch {
      return null;
    }
  }

  private isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(EXPIRES_KEY);
    if (!expiresAt) {
      return true;
    }
    return new Date(expiresAt).getTime() <= Date.now();
  }
}
