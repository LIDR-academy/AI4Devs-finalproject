'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { useBookingHold, useConfirmBooking } from '@/services/bookingService';
import { usePropertyDetails } from '@/services/propertyService';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { PaymentForm } from '@/components/booking/PaymentForm';
import { HoldCountdownBanner } from '@/components/booking/HoldCountdownBanner';
import { Label } from '@/components/shared/ui';
import { formatDateRange } from '@/lib/formatDate';
import type { ConfirmationSessionData } from '@/types/booking';

/**
 * Checkout Page — /booking/checkout
 *
 * Query params expected:
 *   propertyId  — UUID of the property
 *   checkIn     — "YYYY-MM-DD"
 *   checkOut    — "YYYY-MM-DD"
 *   guestCount  — integer (default 1)
 *
 * Flow:
 *   1. Read params from URL search params.
 *   2. On first render, POST /api/v1/bookings → receive bookingId,
 *      clientSecret, priceBreakdown, holdExpiresAt.
 *   3. Render the editorial "Confirm and pay" layout: hold banner (full width),
 *      "Your trip" + "Pay with" (left), BookingSummary (right).
 *   4. On successful Stripe payment, POST confirm → store confirmation
 *      data in sessionStorage → navigate to /confirmation/{bookingId}.
 *   5. If hold expires, redirect to the property page with ?expired=true.
 *   6. Handle API errors (409 → dates taken, 400 → validation).
 */
function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── URL params ──────────────────────────────────────────────────────────
  const propertyId = searchParams.get('propertyId') ?? '';
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const guestCount = parseInt(searchParams.get('guestCount') ?? '1', 10);

  const hasParams = !!propertyId && !!checkIn && !!checkOut;

  // ── Auth / params gate ────────────────────────────────────────────────────
  // 'checking' → effect not yet run; 'ready' → hold may be created;
  // 'redirecting' → bounced to login (no JWT). Idempotent under Strict-Mode
  // double-invoke (the redirect is a no-op the second time).
  const [authState, setAuthState] = useState<'checking' | 'ready' | 'redirecting'>('checking');

  // Confirmation-step failures (Stripe → confirm endpoint) are surfaced as a
  // page error too; the hold itself is created via the query above.
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasParams) {
      // Params error is derived below; nothing to gate.
      setAuthState('ready');
      return;
    }
    if (!localStorage.getItem('auth_token')) {
      const redirectUrl = `/booking/checkout?${searchParams.toString()}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      setAuthState('redirecting');
      return;
    }
    setAuthState('ready');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once

  // ── Queries / mutations ─────────────────────────────────────────────────
  const { data: property, isLoading: propertyLoading } = usePropertyDetails(propertyId);
  const confirmBooking = useConfirmBooking();

  // ── Create booking hold (params-keyed query → Strict-Mode-safe) ──────────
  const holdReq = hasParams
    ? { property_id: propertyId, check_in: checkIn, check_out: checkOut, guest_count: guestCount }
    : null;
  const {
    data: booking,
    error: holdError,
    isLoading: holdLoading,
  } = useBookingHold(holdReq, authState === 'ready');

  // ── Derived page error (no state) ─────────────────────────────────────────
  const pageError: string | null = !hasParams
    ? 'Missing booking parameters. Please go back and try again.'
    : holdError
      ? holdError.status === 409
        ? 'Those dates are no longer available. Please go back and choose different dates.'
        : holdError.status === 400
          ? `Validation error: ${holdError.message}`
          : (holdError.message ?? 'Failed to create booking. Please try again.')
      : confirmError;

  // ── Stripe success → confirm booking ────────────────────────────────────
  const handlePaymentSuccess = (paymentIntentId: string) => {
    if (!booking) return;

    confirmBooking.mutate(
      { bookingId: booking.booking_id, payload: { payment_intent_id: paymentIntentId } },
      {
        onSuccess: (data) => {
          if (!booking) return;
          // booking_id comes from the CREATE response (booking.booking_id).
          // The CONFIRM response (data) is BookingDetailResponse: it has
          // data.id (not data.booking_id), data.property.title (not
          // data.property_title), and data.price_breakdown.total_eur
          // (not data.total_eur).
          const bookingId = booking.booking_id;
          const sessionData: ConfirmationSessionData = {
            booking_id: bookingId,
            reference_number: data.reference_number,
            property_title: data.property?.title ?? property?.title ?? 'Your stay',
            property_photo_url: property?.photos?.[0]?.url,
            check_in: data.check_in ?? checkIn,
            check_out: data.check_out ?? checkOut,
            total_eur: data.price_breakdown?.total_eur ?? booking.price_breakdown.total_eur,
          };
          try {
            sessionStorage.setItem(
              `confirmation_${bookingId}`,
              JSON.stringify(sessionData),
            );
          } catch {
            // sessionStorage unavailable (e.g. private mode) — ignore; confirmation
            // page will fall back gracefully.
          }
          router.push(`/confirmation/${bookingId}`);
        },
        onError: (err) => {
          setConfirmError(`Payment confirmation failed: ${err.message}`);
        },
      },
    );
  };

  const handlePaymentError = (msg: string) => {
    // PaymentForm already shows the inline error; no additional action needed.
    console.error('Payment error:', msg);
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (propertyLoading || authState === 'checking' || (authState === 'ready' && holdLoading)) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-8"
        data-testid="checkout-loading"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-border rounded-card w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-border rounded-card" />
            <div className="h-64 bg-border rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (pageError) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-8"
        data-testid="checkout-error"
        role="alert"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-taupe hover:text-ink mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="p-4 bg-terracotta-tint border border-border rounded-card text-terracotta">
          <h2 className="font-semibold mb-1">Booking error</h2>
          <p className="text-sm">{pageError}</p>
        </div>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-terracotta hover:underline"
        >
          Back to search
        </Link>
      </div>
    );
  }

  // ── Not yet ready (booking not created, property still loading) ──────────
  if (!booking || !property) {
    return null;
  }

  // ── Confirmation in progress ─────────────────────────────────────────────
  if (confirmBooking.isPending) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-8 text-center"
        data-testid="checkout-confirming"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-border rounded-card w-64 mx-auto" />
          <div className="h-4 bg-border rounded-card w-48 mx-auto" />
        </div>
        <p className="mt-6 text-taupe">Confirming your booking…</p>
      </div>
    );
  }

  // ── Main checkout view ───────────────────────────────────────────────────
  const editTripHref = `/property/${propertyId}?check_in=${checkIn}&check_out=${checkOut}`;

  return (
    <>
      {/* Full-width hold countdown banner */}
      <HoldCountdownBanner
        holdExpiresAt={booking.hold_expires_at}
        onHoldExpired={() => router.replace(`/property/${propertyId}?expired=true`)}
      />

      <div className="max-w-4xl mx-auto px-4 py-8" data-testid="checkout-page">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-taupe hover:text-ink mb-6 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-serif text-ink mb-6">Confirm and pay</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: your trip + payment */}
          <div>
            {/* Your trip */}
            <h2 className="font-serif text-ink text-lg mb-4">Your trip</h2>

            <div className="flex items-start justify-between">
              <div>
                <Label>Dates</Label>
                <p className="text-ink text-sm mt-1">{formatDateRange(checkIn, checkOut)}</p>
              </div>
              <Link
                href={editTripHref}
                aria-label="Edit dates"
                className="text-sm text-terracotta underline hover:opacity-70"
              >
                Edit
              </Link>
            </div>

            <div className="border-t border-divider my-4" />

            <div className="flex items-start justify-between">
              <div>
                <Label>Guests</Label>
                <p className="text-ink text-sm mt-1">
                  {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                </p>
              </div>
              <Link
                href={editTripHref}
                aria-label="Edit guests"
                className="text-sm text-terracotta underline hover:opacity-70"
              >
                Edit
              </Link>
            </div>

            <div className="border-t border-divider my-4" />

            {/* Pay with */}
            <h2 className="font-serif text-ink text-lg mb-4">Pay with</h2>
            <div className="rounded-card border border-border bg-surface p-5">
              <PaymentForm
                clientSecret={booking.stripe_client_secret}
                bookingId={booking.booking_id}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>

            {/* Legal fine print */}
            <p className="mt-4 text-xs text-taupe">
              By selecting the button above, you agree to the Host&rsquo;s{' '}
              <a href="#" className="underline hover:opacity-70">House Rules</a>,{' '}
              <a href="#" className="underline hover:opacity-70">Ground rules for guests</a>, and StayHub&rsquo;s{' '}
              <a href="#" className="underline hover:opacity-70">Rebooking and Refund Policy</a>.
            </p>
          </div>

          {/* Right: booking summary */}
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+1rem)]">
            <BookingSummary property={property} priceBreakdown={booking.price_breakdown} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageContent />
    </Suspense>
  );
}
