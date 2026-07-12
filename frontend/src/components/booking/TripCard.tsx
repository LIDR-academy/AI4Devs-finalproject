'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { BookingSummary } from '@/types';
import { formatDate } from '@/lib/formatDate';
import { bookingStatusBadgeClass } from '@/lib/bookingStatus';

interface TripCardProps {
  trip: BookingSummary;
  onClick: (bookingId: string) => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(trip.id)}
      aria-label={`View booking ${trip.reference_number}`}
      data-testid="trip-card"
      data-booking-id={trip.id}
      className="group flex w-full gap-4 overflow-hidden rounded-card border border-border bg-surface p-3 text-left transition-colors hover:border-terracotta"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-card bg-border">
        <img
          src={trip.property_photo_url}
          alt={`Photo of ${trip.property_title}`}
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/200x200?text=No+Image';
          }}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="uppercase tracking-wide text-xs text-taupe">{trip.city}</p>
          <span
            data-testid="trip-status"
            className={bookingStatusBadgeClass(trip.status)}
          >
            {trip.status}
          </span>
        </div>
        <h3 className="line-clamp-1 font-serif text-ink text-base">{trip.property_title}</h3>
        <p className="text-xs text-taupe">
          {formatDate(trip.check_in)} → {formatDate(trip.check_out)}
        </p>
        <p className="text-xs text-taupe">{trip.reference_number}</p>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="uppercase tracking-wide text-xs text-taupe">Total</p>
            <p className="font-serif text-ink text-base">€{trip.total_eur.toFixed(2)}</p>
          </div>
          <span className="text-terracotta text-sm font-medium inline-flex items-center gap-1">
            View details <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </button>
  );
}
