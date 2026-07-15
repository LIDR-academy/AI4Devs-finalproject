import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface InvitationResponse {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail?: string;
  sentVia?: string;
  sentAt?: string;
  deliveryStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  getInvitations(slug: string): Observable<InvitationResponse[]> {
    return this.http.get<InvitationResponse[]>(`${this.apiUrl}/events/${slug}/invitations`);
  }

  sendInvitations(slug: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${slug}/invitations/send`, {});
  }
}
