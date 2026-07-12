'use client';

import React from 'react';

/** Loading placeholder mirroring the property detail layout (gallery + title + body + side column). */
export function PropertyDetailSkeleton() {
  return (
    <div
      data-testid="property-detail-skeleton"
      className="mx-auto max-w-5xl animate-pulse px-4 py-8"
      aria-hidden="true"
    >
      <div className="h-96 w-full rounded-card bg-border" />
      <div className="mt-6 h-8 w-2/3 rounded bg-border" />
      <div className="mt-3 h-4 w-1/2 rounded bg-border" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="h-4 w-full rounded bg-border" />
          <div className="h-4 w-full rounded bg-border" />
          <div className="h-4 w-5/6 rounded bg-border" />
          <div className="h-4 w-4/6 rounded bg-border" />
        </div>
        <div className="h-64 rounded-card bg-border" />
      </div>
    </div>
  );
}
