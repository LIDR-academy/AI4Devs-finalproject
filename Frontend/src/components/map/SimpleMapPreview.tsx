import React from 'react';
import { useTranslation } from 'react-i18next';

interface LatLng {
  lat: number;
  lng: number;
}

interface SimpleMapPreviewProps {
  origin?: LatLng | null;
  destination?: LatLng | null;
  height?: number | string;
  interactive?: boolean;
  ariaLabel?: string;
  showRoute?: boolean;
  onRouteLoaded?: (route: any) => void;
  onRouteError?: (error: Error) => void;
}

export const SimpleMapPreview: React.FC<SimpleMapPreviewProps> = ({
  origin,
  destination,
  height = 180,
  interactive = false,
  ariaLabel,
  showRoute = false,
  onRouteLoaded,
  onRouteError,
}) => {
  const { t } = useTranslation('map');

  if (!origin && !destination) {
    return (
      <div 
        aria-label={ariaLabel || t('noCoordinates')} 
        data-testid="map-container"
        style={{ 
          height, 
          width: '100%', 
          borderRadius: 8, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#f3f4f6',
          color: '#6b7280'
        }}
      >
        {t('noCoordinates')}
      </div>
    );
  }

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const openInWaze = (lat: number, lng: number) => {
    window.open(`https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`, '_blank');
  };

  return (
    <div 
      aria-label={ariaLabel} 
      data-testid="map-container"
      style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden', position: 'relative' }}
    >
      <div style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#f0f8ff',
        border: '2px solid #e5e7eb',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>{t('location')}</h3>
          
          {origin && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              backgroundColor: '#dbeafe', 
              borderRadius: '6px',
              border: '1px solid #93c5fd'
            }}>
              <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '5px' }}>{t('origin')}</div>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                Lat: {origin.lat.toFixed(6)}, Lng: {origin.lng.toFixed(6)}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={() => openInGoogleMaps(origin.lat, origin.lng)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('googleMaps')}
                </button>
                <button
                  onClick={() => openInWaze(origin.lat, origin.lng)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('waze')}
                </button>
              </div>
            </div>
          )}

          {destination && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              backgroundColor: '#d1fae5', 
              borderRadius: '6px',
              border: '1px solid #6ee7b7'
            }}>
              <div style={{ fontWeight: 'bold', color: '#047857', marginBottom: '5px' }}>{t('destination')}</div>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                Lat: {destination.lat.toFixed(6)}, Lng: {destination.lng.toFixed(6)}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={() => openInGoogleMaps(destination.lat, destination.lng)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('googleMaps')}
                </button>
                <button
                  onClick={() => openInWaze(destination.lat, destination.lng)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('waze')}
                </button>
              </div>
            </div>
          )}

          {showRoute && origin && destination && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: '#fef3c7', 
              borderRadius: '6px',
              border: '1px solid #fbbf24'
            }}>
              <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '5px' }}>{t('route')}</div>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                {t('approximateDistance', { distance: calculateDistance(origin, destination).toFixed(1) })}
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {t('clickButtons')}
        </div>
      </div>
    </div>
  );
};

// Función para calcular la distancia aproximada entre dos puntos
function calculateDistance(origin: LatLng, destination: LatLng): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLng = (destination.lng - origin.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default SimpleMapPreview;
