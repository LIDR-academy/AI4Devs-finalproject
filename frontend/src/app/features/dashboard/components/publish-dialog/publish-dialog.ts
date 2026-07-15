import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../../core/services/payment.service';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-publish-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publish-dialog.html',
  styleUrls: ['./publish-dialog.scss']
})
export class PublishDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() eventSlug!: string;
  @Output() close = new EventEmitter<void>();
  @Output() published = new EventEmitter<void>();

  @ViewChild('paymentElement') paymentElementRef!: ElementRef;

  selectedTier: number | null = null;
  loading = false;
  processing = false;
  error: string | null = null;
  clientSecret: string | null = null;
  
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  paymentElement: StripePaymentElement | null = null;

  constructor(private paymentService: PaymentService) {}

  async ngOnInit() {
    this.stripe = await loadStripe(environment.stripePublishableKey);
  }

  ngAfterViewInit() {
    // If clientSecret is already fetched, mount
    if (this.clientSecret && this.stripe && !this.paymentElement) {
      this.mountPaymentElement();
    }
  }

  ngOnDestroy() {
    if (this.paymentElement) {
      this.paymentElement.destroy();
    }
  }

  selectTier(tier: number) {
    this.selectedTier = tier;
    this.fetchClientSecret();
  }

  fetchClientSecret() {
    if (this.selectedTier === null) return;
    this.loading = true;
    this.error = null;

    this.paymentService.publishEvent(this.eventSlug, this.selectedTier).subscribe({
      next: (res) => {
        this.clientSecret = res.clientSecret;
        this.loading = false;
        setTimeout(() => this.mountPaymentElement(), 0);
      },
      error: (err) => {
        this.error = 'Failed to initialize payment. Please try again.';
        this.loading = false;
      }
    });
  }

  mountPaymentElement() {
    if (!this.stripe || !this.clientSecret || !this.paymentElementRef) return;

    this.elements = this.stripe.elements({
      clientSecret: this.clientSecret,
      appearance: { theme: 'stripe' }
    });

    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount(this.paymentElementRef.nativeElement);
  }

  async submitPayment() {
    if (!this.stripe || !this.elements) return;

    this.processing = true;
    this.error = null;

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`, // or any success page
      },
      redirect: 'if_required'
    });

    if (error) {
      this.error = error.message || 'Payment failed.';
      this.processing = false;
    } else {
      this.processing = false;
      this.published.emit();
    }
  }

  onClose() {
    this.close.emit();
  }
}
