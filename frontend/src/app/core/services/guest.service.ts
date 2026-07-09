import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GuestResponse {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  category: string;
  inviteStatus: string;
  createdAt: string;
}

export interface AddGuestRequest {
  name: string;
  email?: string;
  phone?: string;
  category?: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: ImportError[];
}

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  getGuests(eventSlug: string, category?: string, search?: string): Observable<GuestResponse[]> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<GuestResponse[]>(`${this.apiUrl}/events/${eventSlug}/guests`, { params });
  }

  addGuest(eventSlug: string, request: AddGuestRequest): Observable<GuestResponse> {
    return this.http.post<GuestResponse>(`${this.apiUrl}/events/${eventSlug}/guests`, request);
  }

  importGuests(eventSlug: string, file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResult>(`${this.apiUrl}/events/${eventSlug}/guests/import`, formData);
  }

  deleteGuest(eventSlug: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${eventSlug}/guests/${id}`);
  }
}
