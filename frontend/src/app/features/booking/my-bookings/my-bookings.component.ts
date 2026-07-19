import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Booking } from '../../../core/models/booking.models';
import { BookingService } from '../services/booking.service';
import { BookingCardComponent } from './booking-card/booking-card.component';

/** US0010 CA1-CA2, CA7 — "Mis Reservas": paginated history, upcoming first. */
@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [RouterLink, BookingCardComponent],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);

  readonly bookings = signal<Booking[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly busyBookingId = signal<string | null>(null);
  readonly toast = signal<string | null>(null);

  readonly hasMore = computed(() => this.bookings().length < this.total());

  private page = 1;
  private readonly PAGE_SIZE = 10;

  ngOnInit(): void {
    this.titleService.setTitle('Mis Reservas — INKSPIRE');
    // US0013: pick up toast message from ReviewFormComponent redirect
    const nav = this.router.getCurrentNavigation();
    const toastMsg = nav?.extras?.state?.['toast'] as string | undefined;
    if (toastMsg) {
      this.showToast(toastMsg);
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.bookingService.getMyBookings(this.page, this.PAGE_SIZE).subscribe({
      next: (response) => {
        this.bookings.update((prev) => (this.page === 1 ? response.data : [...prev, ...response.data]));
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  loadMore(): void {
    this.page += 1;
    this.load();
  }

  /** CA8-CA9 — attendance confirmed: card refreshes to completed + review CTA. */
  onComplete(booking: Booking): void {
    this.runAction(booking, this.bookingService.completeBooking(booking.id), 'Asistencia confirmada');
  }

  /** CA10-CA11 — cancellation: card refreshes to cancelled. */
  onCancel(booking: Booking): void {
    this.runAction(booking, this.bookingService.cancelBooking(booking.id), 'Reserva cancelada');
  }

  /** Retoma el pago de un hold vivo (US0008/US0009): nueva orden Flow y redirect al checkout. */
  onPay(booking: Booking): void {
    this.busyBookingId.set(booking.id);
    this.bookingService.createPayment(booking.id).subscribe({
      next: (response) => this.bookingService.redirectTo(response.paymentUrl),
      error: () => {
        this.busyBookingId.set(null);
        this.showToast('El tiempo de reserva expiró. Vuelve a elegir un horario.');
        this.page = 1;
        this.load();
      }
    });
  }

  private runAction(booking: Booking, action$: ReturnType<BookingService['completeBooking']>, message: string): void {
    this.busyBookingId.set(booking.id);
    action$.subscribe({
      next: (updated) => {
        this.bookings.update((list) => list.map((b) => (b.id === updated.id ? updated : b)));
        this.busyBookingId.set(null);
        this.showToast(message);
      },
      error: () => {
        this.busyBookingId.set(null);
        this.showToast('No pudimos actualizar la reserva. Inténtalo de nuevo.');
      }
    });
  }

  private showToast(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(null), 4000);
  }
}
