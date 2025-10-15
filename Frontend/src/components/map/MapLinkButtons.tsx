import React from 'react';

interface MapLinkButtonsProps {
  lat: number;
  lng: number;
}

function toGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function toWazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
}

export const MapLinkButtons: React.FC<MapLinkButtonsProps> = ({ lat, lng }) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  const gm = toGoogleMapsUrl(lat, lng);
  const waze = toWazeUrl(lat, lng);
  return (
    <div className="flex items-center gap-2">
      <a
        href={gm}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"
        aria-label="Abrir en Google Maps"
      >
        Google Maps
      </a>
      <a
        href={waze}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"
        aria-label="Abrir en Waze"
      >
        Waze
      </a>
    </div>
  );
};

export default MapLinkButtons;


