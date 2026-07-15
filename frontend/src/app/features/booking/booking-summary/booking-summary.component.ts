import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BookingService } from '../services/booking.service';

/** US0008 CA4-CA8 — Booking summary with 5-minute countdown before paying the deposit. */
@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './booking-summary.component.html',
  styleUrl: './booking-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingSummaryComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);

  readonly booking = this.bookingService.currentBooking;
  readonly remainingSeconds = signal(0);
  readonly expired = computed(() => this.remainingSeconds() <= 0);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const booking = this.booking();
    if (!booking) {
      this.router.navigate(['/']);
      return;
    }
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
  }

  get countdownLabel(): string {
    const total = Math.max(0, this.remainingSeconds());
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  durationLabel(): string {
    const booking = this.booking();
    if (!booking) {
      return '';
    }
    const minutes = this.toMinutes(booking.endTime) - this.toMinutes(booking.startTime);
    return minutes % 60 === 0 ? `${minutes / 60} h` : `${minutes} min`;
  }

  payDeposit(): void {
    const booking = this.booking();
    if (!booking || this.expired()) {
      return;
    }
    // US0009 will implement the payment page at this route
    this.router.navigate(['/pago', booking.id]);
  }

  formatCLP(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(amount);
  }

  private tick(): void {
    const expiresAt = this.booking()?.expiresAt;
    if (!expiresAt) {
      this.remainingSeconds.set(0);
      return;
    }
    const remaining = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    this.remainingSeconds.set(Math.max(0, remaining));
    if (remaining <= 0 && this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
