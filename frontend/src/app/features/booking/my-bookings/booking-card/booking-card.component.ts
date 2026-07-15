import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Booking } from '../../../../core/models/booking.models';

type PendingAction = 'complete' | 'cancel' | null;

/** US0010 CA3-CA6, CA8-CA10 — Booking card with status badge, detail and actions. */
@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './booking-card.component.html',
  styleUrl: './booking-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingCardComponent {
  readonly booking = input.required<Booking>();
  readonly busy = input(false);
  readonly complete = output<Booking>();
  readonly cancel = output<Booking>();
  readonly pay = output<Booking>();

  readonly expanded = signal(false);
  /** Inline confirmation step (CA10 dialog / "¿Asististe?" antes de completar). */
  readonly pendingAction = signal<PendingAction>(null);

  readonly isPast = computed(() => {
    const b = this.booking();
    return new Date(`${b.bookingDate}T${b.endTime}:00`) < new Date();
  });

  readonly canComplete = computed(() => this.booking().status === 'confirmed' && this.isPast());
  readonly canCancel = computed(() => this.booking().status === 'confirmed' && !this.isPast());
  readonly showReviewCta = computed(
    () => this.booking().status === 'completed' && !this.booking().hasReview
  );

  /** Hold vivo (US0008): el backend solo lista pending_payment no expirados, pero re-chequeamos por si la vista quedó abierta. */
  readonly canPay = computed(() => {
    const b = this.booking();
    return b.status === 'pending_payment' && !!b.expiresAt && new Date(b.expiresAt) > new Date();
  });

  statusLabel(): string {
    const labels: Record<string, string> = {
      pending_payment: 'Pendiente de pago',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[this.booking().status] ?? this.booking().status;
  }

  toggleDetail(): void {
    this.expanded.update((v) => !v);
  }

  ask(action: 'complete' | 'cancel'): void {
    this.pendingAction.set(action);
  }

  dismiss(): void {
    this.pendingAction.set(null);
  }

  confirmPending(): void {
    const action = this.pendingAction();
    this.pendingAction.set(null);
    if (action === 'complete') {
      this.complete.emit(this.booking());
    } else if (action === 'cancel') {
      this.cancel.emit(this.booking());
    }
  }

  formatCLP(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
