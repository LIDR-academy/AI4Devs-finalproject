import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../services/booking.service';

/**
 * Simulated Flow checkout used while Flow:UseMock=true in the backend
 * (no sandbox credentials yet). Replaced by the real Flow redirect later.
 */
@Component({
  selector: 'app-mock-checkout',
  standalone: true,
  templateUrl: './mock-checkout.component.html',
  styleUrl: './mock-checkout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MockCheckoutComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingService = inject(BookingService);

  readonly token: string = this.route.snapshot.queryParams['token'] ?? '';
  readonly amount: number = Number(this.route.snapshot.queryParams['amount'] ?? 0);
  readonly processing = signal(false);
  readonly error = signal(false);

  simulate(paid: boolean): void {
    if (!this.token || this.processing()) {
      return;
    }
    this.processing.set(true);
    this.error.set(false);
    this.bookingService.sendMockOutcome(this.token, paid).subscribe({
      next: (response) => this.bookingService.redirectTo(response.returnUrl),
      error: () => {
        this.processing.set(false);
        this.error.set(true);
      }
    });
  }

  formatCLP(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
