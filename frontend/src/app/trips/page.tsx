'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TripCard } from '@/components/booking/TripCard';
import { TripCardSkeleton } from '@/components/shared/TripCardSkeleton';
import { useMyTrips, type TripFilter } from '@/services/tripsService';

const FILTERS: { key: TripFilter; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all', label: 'All' },
];

function parseFilter(raw: string | null): TripFilter {
  if (raw === 'upcoming' || raw === 'past' || raw === 'cancelled' || raw === 'all') {
    return raw;
  }
  return 'upcoming';
}

function TripsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = parseFilter(searchParams.get('status'));

  const { data, isLoading, error } = useMyTrips(filter, 1, 50);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-serif text-ink">My Trips</h1>

      <div className="mt-4 flex gap-2 border-b border-border" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            data-testid={`trips-filter-${f.key}`}
            onClick={() => router.push(`/trips?status=${f.key}`)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              filter === f.key
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-taupe hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading && (
          <ul className="flex flex-col gap-3" data-testid="trips-loading">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <TripCardSkeleton />
              </li>
            ))}
          </ul>
        )}

        {error && !isLoading && (
          <p className="py-12 text-center text-terracotta" role="alert">
            We couldn&apos;t load your trips. Please try again.
          </p>
        )}

        {!isLoading && !error && data && data.bookings.length === 0 && (
          <p className="py-12 text-center text-taupe" data-testid="trips-empty">
            You have no trips here yet.
          </p>
        )}

        {!isLoading && !error && data && data.bookings.length > 0 && (
          <ul className="flex flex-col gap-3" data-testid="trips-list">
            {data.bookings.map((trip) => (
              <li key={trip.id}>
                <TripCard trip={trip} onClick={(id) => router.push(`/trips/${id}`)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default function TripsPage() {
  return (
    <Suspense>
      <TripsPageContent />
    </Suspense>
  );
}
