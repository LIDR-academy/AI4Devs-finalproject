'use client';

import React from 'react';
import { MapPin, Star, ShieldCheck } from 'lucide-react';
import type { Property, PriceBreakdown } from '@/types';
import { Label } from '@/components/shared/ui';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function formatEur(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

// --------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------

export interface BookingSummaryProps {
  property: Property;
  priceBreakdown: PriceBreakdown;
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

/**
 * BookingSummary (editorial right-column card)
 *
 * Displays the editorial summary of the booking being checked out:
 * - Property photo, editorial type/city label, serif title, rating, location
 * - Full price breakdown
 * - A separate Total card
 * - A "Safe and secure booking" reassurance card
 *
 * The hold-expiry countdown now lives in HoldCountdownBanner, and the
 * dates/guests rows live in the checkout page's "Your trip" section.
 */
export function BookingSummary({ property, priceBreakdown }: BookingSummaryProps) {
  // First photo or placeholder
  const photoUrl = property.photos?.[0]?.url;
  const showRating = property.avg_rating != null && property.review_count > 0;

  return (
    <div data-testid="booking-summary">
      {/* Summary card */}
      <div className="rounded-card border border-border bg-surface overflow-hidden">
        {/* Property hero */}
        <div className="flex gap-4 p-4 border-b border-divider">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={property.title}
              className="w-24 h-20 object-cover rounded-card flex-shrink-0"
            />
          ) : (
            <div
              className="w-24 h-20 rounded-card bg-canvas flex-shrink-0"
              aria-hidden
            />
          )}
          <div className="min-w-0">
            <Label>
              {property.property_type} in {property.location.city}
            </Label>
            <p className="font-serif text-ink text-base leading-tight line-clamp-2 mt-1">
              {property.title}
            </p>
            {showRating && (
              <div className="flex items-center gap-1 mt-1 text-xs text-taupe">
                <Star className="w-4 h-4 text-terracotta fill-terracotta flex-shrink-0" aria-hidden />
                <span className="text-ink">{property.avg_rating!.toFixed(2)}</span>
                <span>({property.review_count} reviews)</span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-1 text-xs text-taupe">
              <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden />
              <span>{property.location.city}, {property.location.country}</span>
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="px-4 py-4 space-y-2 text-sm">
          <h3 className="font-serif text-ink text-base mb-2">Price details</h3>
          <div className="space-y-2" data-testid="price-breakdown-table">
            <div className="flex justify-between">
              <span className="text-taupe underline underline-offset-2 decoration-border">
                {formatEur(priceBreakdown.nightly_rate_eur)} × {priceBreakdown.nights}{' '}
                {priceBreakdown.nights === 1 ? 'night' : 'nights'}
              </span>
              <span className="text-ink">{formatEur(priceBreakdown.subtotal_eur)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-taupe underline underline-offset-2 decoration-border">Cleaning fee</span>
              <span className="text-ink">{formatEur(priceBreakdown.cleaning_fee_eur)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-taupe underline underline-offset-2 decoration-border">Service fee</span>
              <span className="text-ink">{formatEur(priceBreakdown.service_fee_eur)}</span>
            </div>

            {priceBreakdown.tax_eur > 0 && (
              <div className="flex justify-between">
                <span className="text-taupe underline underline-offset-2 decoration-border">Taxes</span>
                <span className="text-ink">{formatEur(priceBreakdown.tax_eur)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total card */}
      <div className="rounded-card border border-border bg-surface px-4 py-3 flex justify-between items-baseline mt-3">
        <span className="font-serif text-ink">Total (EUR)</span>
        <span className="font-serif text-ink text-lg" data-testid="price-total">
          {formatEur(priceBreakdown.total_eur)}
        </span>
      </div>

      {/* Safe & secure card */}
      <div className="rounded-card border border-border bg-surface p-4 mt-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-terracotta flex-shrink-0" aria-hidden />
          <Label>Safe and secure booking</Label>
        </div>
        <p className="text-taupe text-xs mt-2">
          Your payment information is encrypted and processed securely.
        </p>
      </div>
    </div>
  );
}
