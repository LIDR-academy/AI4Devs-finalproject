'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { PropertySummary } from '@/types';

interface Viewport {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface MapViewProps {
  properties: PropertySummary[];
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  onPropertyHover: (propertyId: string | null) => void;
  onPropertyClick: (propertyId: string) => void;
  hoveredPropertyId?: string;
  selectedPropertyId?: string;
}

// Dynamically import the client component to avoid react-map-gl SSR issues
const MapViewClient = dynamic(
  () => import('./MapView.client').then((mod) => mod.MapViewClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
);

/**
 * MapView Component
 *
 * Renders an interactive Mapbox map with property pins (markers).
 * Displays property information on hover and click.
 * Used in search results to show property locations geographically.
 */
export function MapView(props: MapViewProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <p className="text-gray-500">Loading map...</p>
        </div>
      }
    >
      <MapViewClient {...props} />
    </Suspense>
  );
}
