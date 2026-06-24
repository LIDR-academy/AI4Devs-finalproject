'use client';

import React, { useCallback, useMemo } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { PropertySummary } from '@/types';

interface Viewport {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface MapViewClientProps {
  properties: PropertySummary[];
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  onPropertyHover: (propertyId: string | null) => void;
  onPropertyClick: (propertyId: string) => void;
  hoveredPropertyId?: string;
  selectedPropertyId?: string;
}

/**
 * MapViewClient Component (Internal)
 *
 * Actual implementation of the MapView using react-map-gl.
 * This is separated to avoid import issues during testing.
 */
export function MapViewClient({
  properties,
  viewport,
  onViewportChange,
  onPropertyHover,
  onPropertyClick,
  hoveredPropertyId,
  selectedPropertyId,
}: MapViewClientProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  const handleViewportChange = useCallback(
    (newViewport: Viewport) => {
      onViewportChange(newViewport);
    },
    [onViewportChange]
  );

  const handleMarkerClick = useCallback(
    (propertyId: string) => {
      onPropertyClick(propertyId);
    },
    [onPropertyClick]
  );

  const handleMarkerHover = useCallback(
    (propertyId: string) => {
      onPropertyHover(propertyId);
    },
    [onPropertyHover]
  );

  const handleMarkerLeave = useCallback(() => {
    onPropertyHover(null);
  }, [onPropertyHover]);

  // Memoize selected property to avoid O(n) lookup in render
  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === selectedPropertyId),
    [properties, selectedPropertyId]
  );

  if (!mapboxToken) {
    return (
      <div
        data-testid="mapbox-map"
        className="flex items-center justify-center w-full h-full bg-canvas"
      >
        <div className="text-center">
          <p className="text-taupe text-sm">Map unavailable: Mapbox token not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" data-testid="map-container">
      <Map
        reuseMaps
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: viewport.longitude,
          latitude: viewport.latitude,
          zoom: viewport.zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMove={(evt) => {
          handleViewportChange({
            longitude: evt.viewState.longitude,
            latitude: evt.viewState.latitude,
            zoom: evt.viewState.zoom,
          });
        }}
        data-testid="mapbox-map"
      >
        {/* Render markers for each property */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            longitude={property.location.lng}
            latitude={property.location.lat}
            anchor="bottom"
            onClick={() => handleMarkerClick(property.id)}
          >
            <div
              data-testid={`marker-${property.id}`}
              className={`cursor-pointer rounded-pill border px-2 py-1 font-sans text-xs font-semibold shadow-sm transition-all ${
                hoveredPropertyId === property.id || selectedPropertyId === property.id
                  ? 'border-terracotta bg-terracotta text-white scale-110'
                  : 'border-border bg-surface text-terracotta hover:scale-105'
              }`}
              onMouseEnter={() => handleMarkerHover(property.id)}
              onMouseLeave={handleMarkerLeave}
            >
              €{property.nightly_rate_eur.toFixed(0)}
            </div>
          </Marker>
        ))}

        {/* Show popup for selected property */}
        {selectedProperty && (
          <Popup
            longitude={selectedProperty.location.lng}
            latitude={selectedProperty.location.lat}
            anchor="top"
            onClose={() => onPropertyClick('')}
            data-testid="popup"
          >
            <div className="max-w-xs">
              <h3 className="text-sm font-serif text-ink line-clamp-1">
                {selectedProperty.title}
              </h3>
              <p className="text-xs text-taupe mt-1">
                €{selectedProperty.nightly_rate_eur.toFixed(0)}/night
              </p>
              {selectedProperty.avg_rating && (
                <p className="text-xs text-taupe mt-1">
                  <span className="text-terracotta">★</span> {selectedProperty.avg_rating.toFixed(1)} ({selectedProperty.review_count} reviews)
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
