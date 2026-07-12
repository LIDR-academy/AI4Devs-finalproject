'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { formatDateRange } from '@/lib/formatDate';
import type { ConfirmationSessionData } from '@/types/booking';
import { Button } from '@/components/shared/ui';

/**
 * Confirmation Page — /confirmation/[id]
 *
 * `[id]` is the bookingId UUID.
 *
 * Reads confirmation data from `sessionStorage` key
 * `confirmation_{bookingId}` set by the checkout page after successful
 * payment.  Falls back to a generic success message if the key is missing
 * (e.g. direct navigation / session cleared).
 *
 * Displays an editorial success card:
 *   - Terracotta check badge + serif "Your trip is booked!" heading
 *   - Stay-details card: property thumbnail, title, reference, dates, total
 *   - Two CTAs: "View in My Trips" and "Back to Search"
 */
export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [data, setData] = useState<ConfirmationSessionData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setLoaded(true);
      return;
    }
    try {
      const raw = sessionStorage.getItem(`confirmation_${bookingId}`);
      if (raw) {
        setData(JSON.parse(raw) as ConfirmationSessionData);
      }
    } catch {
      // sessionStorage unavailable or JSON parse failed — show fallback
    }
    setLoaded(true);
  }, [bookingId]);

  if (!loaded) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center" data-testid="confirmation-loading">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-border rounded-card mx-auto" />
          <div className="h-6 bg-border rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div
        className="bg-surface rounded-card border border-border p-8 sm:p-10 text-center"
        data-testid="confirmation-page"
      >
        {/* Success badge */}
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-card bg-terracotta"
            data-testid="confirmation-icon"
          >
            <Check className="w-8 h-8 text-white" aria-hidden />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-serif text-ink mb-2">Your trip is booked!</h1>
        <p className="text-taupe mb-6">
          {data
            ? 'A confirmation email has been sent to your inbox.'
            : 'Your payment was processed successfully.'}
        </p>

        {/* Stay details card */}
        {data && (
          <div
            className="rounded-card border border-border bg-canvas p-5 text-left"
            data-testid="confirmation-details"
          >
            {/* Property thumbnail + title + reference */}
            <div className="flex items-center gap-4">
              {data.property_photo_url ? (
                <img
                  src={data.property_photo_url}
                  alt={data.property_title}
                  className="w-16 h-16 rounded-card object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-card bg-border flex-shrink-0" aria-hidden />
              )}
              <div>
                <p className="font-serif text-ink">{data.property_title}</p>
                {data.reference_number && (
                  <p
                    className="text-xs uppercase tracking-wide text-terracotta font-medium"
                    data-testid="reference-number-block"
                  >
                    REF: <span data-testid="reference-number">{data.reference_number}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-divider my-4" />

            {/* Dates + total */}
            <div className="flex justify-between">
              <div>
                <p className="uppercase tracking-wide text-xs text-taupe">Dates</p>
                <p className="text-ink text-sm mt-1">
                  {formatDateRange(data.check_in, data.check_out)}
                </p>
              </div>
              <div className="text-right">
                <p className="uppercase tracking-wide text-xs text-taupe">Total paid</p>
                <p className="text-ink font-semibold mt-1" data-testid="total-paid">
                  €{data.total_eur.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button
            variant="primary"
            className="w-full sm:w-auto justify-center"
            onClick={() => router.push('/trips')}
            data-testid="view-trips-button"
          >
            View in My Trips
          </Button>

          <Button
            variant="secondary"
            className="w-full sm:w-auto justify-center"
            onClick={() => router.push('/')}
            data-testid="back-to-search-button"
          >
            Back to Search
          </Button>
        </div>
      </div>
    </div>
  );
}
