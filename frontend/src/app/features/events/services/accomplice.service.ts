import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccompliceResponse, InviteAccompliceRequest } from '../../../core/models/accomplice.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccompliceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/accomplices`;

  getAccomplices(eventSlug: string): Observable<AccompliceResponse[]> {
    return this.http.get<AccompliceResponse[]>(`${this.apiUrl}/${eventSlug}`);
  }

  inviteAccomplice(eventSlug: string, request: InviteAccompliceRequest): Observable<AccompliceResponse> {
    return this.http.post<AccompliceResponse>(`${this.apiUrl}/${eventSlug}`, request);
  }

  resendInvite(eventSlug: string, accompliceId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventSlug}/resend`, { accompliceId });
  }

  revokeAccess(eventSlug: string, accompliceId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${eventSlug}/revoke`, { accompliceId });
  }
}
