'use client';

import React from 'react';

/** Loading placeholder mirroring PropertyCard's shape (image + title/location/price/rating). */
export function PropertyCardSkeleton() {
  return (
    <div
      data-testid="property-card-skeleton"
      className="animate-pulse overflow-hidden rounded-lg bg-white shadow-sm"
      aria-hidden="true"
    >
      <div className="aspect-square w-full bg-gray-200" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-3 w-1/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}
