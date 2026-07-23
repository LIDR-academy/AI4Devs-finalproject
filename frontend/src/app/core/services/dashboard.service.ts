import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DietaryRestrictionDto {
  guestName: string;
  restrictions: string;
}

export interface GuestExportDto {
  id: string;
  name: string;
  inviteStatus?: string;
  email?: string;
  phone?: string;
  category: string;
  rsvpStatus: string;
  dietaryRestrictions?: string;
  transportNeeds: boolean;
}

export interface DashboardStatsResponse {
  totalInvited: number;
  confirmed: number;
  declined: number;
  pending: number;
  maybe: number;
  transportNeedsCount: number;
  plusOneCount: number;
  dietaryRestrictions: DietaryRestrictionDto[];
  guestList: GuestExportDto[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  getDashboardStats(slug: string): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(`${this.apiUrl}/events/${slug}/dashboard`);
  }

  exportGuestListCsv(slug: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/events/${slug}/guests/export`, {
      responseType: 'blob'
    });
  }
}
