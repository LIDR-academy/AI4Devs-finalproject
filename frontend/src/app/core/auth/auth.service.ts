import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoaded: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private state = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoaded: false
  });

  private refreshTimer: any;

  readonly isAuthenticated = () => this.state().isAuthenticated;
  readonly user = () => this.state().user;
  readonly isLoaded = () => this.state().isLoaded;

  requestMagicLink(email: string): Observable<any> {
    return this.http.post('/api/auth/magic-link', { email });
  }

  verifyToken(token: string): Observable<any> {
    return this.http.post('/api/auth/verify', { token }).pipe(
      tap((res: any) => {
        if (res.user) {
          this.state.set({
            isAuthenticated: true,
            user: res.user,
            isLoaded: true
          });
          this.setupRefreshTimer(res.tokenExpiry);
        }
      })
    );
  }

  setupProfile(data: { name: string; termsAccepted: boolean }): Observable<any> {
    return this.http.post('/api/auth/profile', data).pipe(
      tap((res: any) => {
        if (res.user) {
          this.state.update(s => ({ ...s, user: res.user }));
        }
      })
    );
  }

  refresh(): Observable<any> {
    return this.http.post('/api/auth/refresh', {}).pipe(
      tap((res: any) => {
        this.setupRefreshTimer(res.tokenExpiry);
      }),
      catchError(err => {
        this.logoutLocal();
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {}).pipe(
      tap(() => this.logoutLocal()),
      catchError(() => {
        this.logoutLocal();
        return of(null);
      })
    );
  }

  logoutLocal() {
    this.state.set({ isAuthenticated: false, user: null, isLoaded: true });
    this.clearRefreshTimer();
    this.router.navigate(['/login']);
  }

  checkAuthStatus(): Observable<any> {
    return this.http.get('/api/auth/me').pipe(
      tap((res: any) => {
        this.state.set({
          isAuthenticated: true,
          user: res.user,
          isLoaded: true
        });
        if (res.tokenExpiry) {
           this.setupRefreshTimer(res.tokenExpiry);
        }
      }),
      catchError(() => {
        this.state.set({
          isAuthenticated: false,
          user: null,
          isLoaded: true
        });
        return of(null);
      })
    );
  }

  private setupRefreshTimer(expiryDateStr: string) {
    this.clearRefreshTimer();
    if (!expiryDateStr) return;
    
    const expiry = new Date(expiryDateStr).getTime();
    const now = Date.now();
    const timeToExpiry = expiry - now;
    
    if (timeToExpiry <= 0) return;
    
    const refreshTime = timeToExpiry * 0.5;
    
    this.refreshTimer = setTimeout(() => {
      this.refresh().subscribe();
    }, refreshTime);
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
