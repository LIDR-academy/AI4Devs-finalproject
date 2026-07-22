import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PublishEventRequest {
  tier: number; // 0 for Standard, 1 for Premium (assuming Enum PaymentTier)
}

export interface PublishEventResponse {
  clientSecret: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  publishEvent(slug: string, tier: number): Observable<PublishEventResponse> {
    return this.http.post<PublishEventResponse>(`${this.apiUrl}/events/${slug}/publish`, { tier });
  }
}
