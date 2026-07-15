import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReviewDto, ReviewRequest } from '../../../core/models/booking.models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);

  /** US0013 CA1-CA9 — Submits the 4-dimension immutable review for a completed booking. */
  createReview(bookingId: string, request: ReviewRequest): Observable<ReviewDto> {
    return this.http.post<ReviewDto>(
      `${environment.apiUrl}/bookings/${bookingId}/review`,
      request
    );
  }
}
