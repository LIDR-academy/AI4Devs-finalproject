import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Booking } from '../../../core/models/booking.models';
import { BookingService } from '../services/booking.service';

/**
 * US0009 CA4-CA5 — Landing after the Flow checkout (/reservas/:bookingId?status=success|failed).
 * Success shows the confirmation screen; failure offers a retry that creates a new Flow order.
 */
@Component({
  selector: 'app-payment-return',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './payment-return.component.html',
  styleUrl: './payment-return.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentReturnComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingService = inject(BookingService);

  readonly booking = signal<Booking | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly success = signal(false);
  readonly retrying = signal(false);
  readonly retryError = signal(false);

  ngOnInit(): void {
    this.success.set(this.route.snapshot.queryParams['status'] === 'success');
    const bookingId = this.route.snapshot.params['bookingId'];
    if (!bookingId) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.bookingService.getBooking(bookingId).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        // The webhook may still be in flight: trust the booking status over the query param
        if (booking.status === 'confirmed') {
          this.success.set(true);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }

  /** CA5 — Retry creates a fresh Flow order for the same booking. */
  retryPayment(): void {
    const booking = this.booking();
    if (!booking || this.retrying()) {
      return;
    }
    this.retrying.set(true);
    this.retryError.set(false);
    this.bookingService.createPayment(booking.id).subscribe({
      next: (response) => this.bookingService.redirectTo(response.paymentUrl),
      error: () => {
        this.retrying.set(false);
        this.retryError.set(true);
      }
    });
  }

  bookingNumber(): string {
    return (this.booking()?.id ?? '').slice(0, 8).toUpperCase();
  }

  formatCLP(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
