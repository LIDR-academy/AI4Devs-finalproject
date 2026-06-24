'use client';

import React from 'react';
import type { PropertySummary } from '@/types';

interface PropertyCardProps {
  property: PropertySummary;
  onClick: (propertyId: string) => void;
}

/**
 * PropertyCard Component
 *
 * Displays a property summary card with photo, title, price, and rating.
 * Used in search results grid.
 */
export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const handleClick = () => {
    onClick(property.id);
  };

  const rating = property.avg_rating || 0;

  return (
    <button
      onClick={handleClick}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-card border border-border bg-surface text-left transition-shadow hover:shadow-md"
      type="button"
      aria-label={`View ${property.title}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-canvas">
        <img
          src={property.photo_url}
          alt={`Photo of ${property.title}`}
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate font-serif text-2xl leading-8 text-ink">
            {property.location.city}, {property.location.country}
          </h3>
          <p className="truncate font-sans text-xs font-medium tracking-[0.02em] text-taupe">
            {property.title}
          </p>
          <p className="mt-1 font-sans text-base font-bold text-ink">
            €{property.nightly_rate_eur.toFixed(0)}{' '}
            <span className="font-normal text-taupe">night</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {property.avg_rating !== null && property.avg_rating !== undefined ? (
            <>
              <span aria-hidden className="text-terracotta">★</span>
              <span aria-hidden className="font-sans text-base text-ink">{rating.toFixed(2)}</span>
              <span className="sr-only">Rated {rating.toFixed(2)} out of 5</span>
            </>
          ) : (
            <span className="font-sans text-xs text-taupe">New</span>
          )}
        </div>
      </div>
    </button>
  );
}
