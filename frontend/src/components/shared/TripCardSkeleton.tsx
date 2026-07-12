'use client';

import React from 'react';

/** Loading placeholder mirroring TripCard's horizontal shape (thumb + stacked lines). */
export function TripCardSkeleton() {
  return (
    <div
      data-testid="trip-card-skeleton"
      className="flex w-full animate-pulse gap-4 rounded-card border border-border bg-surface p-3"
      aria-hidden="true"
    >
      <div className="h-24 w-24 flex-shrink-0 rounded-card bg-border" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-4 w-2/3 rounded bg-border" />
        <div className="h-3 w-1/3 rounded bg-border" />
        <div className="h-3 w-1/2 rounded bg-border" />
        <div className="h-4 w-1/4 rounded bg-border" />
      </div>
    </div>
  );
}
