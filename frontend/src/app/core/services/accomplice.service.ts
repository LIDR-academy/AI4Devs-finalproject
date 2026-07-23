import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AccompliceResponse {
  id: string;
  email: string;
  permissions: string[];
  grantedAt: string;
  lastAccessedAt?: string;
  isRevoked: boolean;
}

export interface GrantAccessRequest {
  email: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AccompliceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/accomplices`;
  private state = signal<any>(null);

  readonly currentAccomplice = () => this.state();

  getAccomplices(eventSlug: string): Observable<AccompliceResponse[]> {
    return this.http.get<AccompliceResponse[]>(`${this.apiUrl}/${eventSlug}`);
  }

  grantAccess(eventSlug: string, request: GrantAccessRequest): Observable<AccompliceResponse> {
    return this.http.post<AccompliceResponse>(`${this.apiUrl}/${eventSlug}/grant`, request);
  }

  revokeAccess(eventSlug: string, accompliceId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventSlug}/revoke/${accompliceId}`, {});
  }

  resendMagicLink(eventSlug: string, accompliceId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventSlug}/resend/${accompliceId}`, {});
  }

  verifyToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verify?token=${token}`);
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  checkAuthStatus(): Observable<any> {
    return this.getMe().pipe(
      tap((res) => this.state.set(res)),
      catchError(() => {
        this.state.set(null);
        return of(null);
      })
    );
  }
}
