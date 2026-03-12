import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';

type LatLng = { lat: number; lng: number };

interface MapPreviewProps {
  origin?: LatLng | null;
  destination?: LatLng | null;
  height?: number | string;
  interactive?: boolean;
  ariaLabel?: string;
  tilesUrl?: string;
}

function FitBounds({ origin, destination }: { origin?: LatLng | null; destination?: LatLng | null }) {
  const map = useMap();
  const hasOrigin = origin && typeof origin.lat === 'number' && typeof origin.lng === 'number';
  const hasDestination = destination && typeof destination.lat === 'number' && typeof destination.lng === 'number';

  useEffect(() => {
    if (hasOrigin && hasDestination) {
      const bounds = [
        [origin!.lat, origin!.lng] as [number, number],
        [destination!.lat, destination!.lng] as [number, number],
      ];
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (hasOrigin) {
      map.setView([origin!.lat, origin!.lng], 13);
    }
  }, [hasOrigin, hasDestination, map, origin, destination]);

  return null;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  origin,
  destination,
  height = 180,
  interactive = false,
  ariaLabel = 'Vista previa de mapa',
  tilesUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}) => {
  const center = useMemo<[number, number] | undefined>(() => {
    if (origin && typeof origin.lat === 'number' && typeof origin.lng === 'number') {
      return [origin.lat, origin.lng];
    }
    if (destination && typeof destination.lat === 'number' && typeof destination.lng === 'number') {
      return [destination.lat, destination.lng];
    }
    return undefined;
  }, [origin, destination]);

  if (!center) {
    return null;
  }

  return (
    <div aria-label={ariaLabel} style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        dragging={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={tilesUrl} attribution='&copy; OpenStreetMap contributors' />
        {origin && (
          <CircleMarker center={[origin.lat, origin.lng]} radius={8} pathOptions={{ color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.7 }} />
        )}
        {destination && (
          <CircleMarker center={[destination.lat, destination.lng]} radius={8} pathOptions={{ color: '#059669', fillColor: '#10B981', fillOpacity: 0.7 }} />
        )}
        <FitBounds origin={origin} destination={destination} />
      </MapContainer>
    </div>
  );
};

export default MapPreview;


