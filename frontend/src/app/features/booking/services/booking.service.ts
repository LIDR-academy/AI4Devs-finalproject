import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Booking,
  BookingHoldRequest,
  WeekAvailabilityResponse
} from '../../../core/models/booking.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);

  /** Booking held in this session, consumed by the summary page (US0008 CA4). */
  readonly currentBooking = signal<Booking | null>(null);

  getWeekAvailability(artistProfileId: string, week: string): Observable<WeekAvailabilityResponse> {
    const params = new HttpParams().set('week', week);
    return this.http.get<WeekAvailabilityResponse>(
      `${environment.apiUrl}/artists/${artistProfileId}/availability`,
      { params }
    );
  }

  holdSlot(request: BookingHoldRequest): Observable<Booking> {
    return this.http.post<Booking>(`${environment.apiUrl}/bookings/hold`, request);
  }
}
