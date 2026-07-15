import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Booking,
  BookingHoldRequest,
  BookingListResponse,
  MockOutcomeResponse,
  PaymentCreateResponse,
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

  getBooking(bookingId: string): Observable<Booking> {
    return this.http.get<Booking>(`${environment.apiUrl}/bookings/${bookingId}`);
  }

  /** US0010 CA1-CA3 — Authenticated client's booking history. */
  getMyBookings(page = 1, pageSize = 10): Observable<BookingListResponse> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<BookingListResponse>(`${environment.apiUrl}/bookings/me`, { params });
  }

  /** US0010 CA8-CA9 — Confirms attendance (confirmed + past date → completed). */
  completeBooking(bookingId: string): Observable<Booking> {
    return this.http.post<Booking>(`${environment.apiUrl}/bookings/${bookingId}/complete`, {});
  }

  /** US0010 CA10-CA11 — Cancels a confirmed future booking. */
  cancelBooking(bookingId: string): Observable<Booking> {
    return this.http.post<Booking>(`${environment.apiUrl}/bookings/${bookingId}/cancel`, {});
  }

  /** US0009 CA1 — Creates the Flow order and returns the checkout URL. */
  createPayment(bookingId: string): Observable<PaymentCreateResponse> {
    return this.http.post<PaymentCreateResponse>(`${environment.apiUrl}/payments/create`, { bookingId });
  }

  /** Dev-only simulated checkout (Flow:UseMock=true in the backend). */
  sendMockOutcome(token: string, paid: boolean): Observable<MockOutcomeResponse> {
    return this.http.post<MockOutcomeResponse>(`${environment.apiUrl}/payments/mock-outcome`, { token, paid });
  }

  /** Leaves the SPA towards the Flow checkout (wrapped so tests can spy it). */
  redirectTo(url: string): void {
    window.location.href = url;
  }
}
