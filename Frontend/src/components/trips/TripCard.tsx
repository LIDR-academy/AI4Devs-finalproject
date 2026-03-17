import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TripDto } from '../../types/api';
import { Button, Card, CardContent } from '../ui';
import SimpleMapPreview from '../map/SimpleMapPreview';
import MapLinkButtons from '../map/MapLinkButtons';
import { env } from '../../env';

interface TripCardProps {
  trip: TripDto;
  onEdit: (trip: TripDto) => void;
  onDelete: (tripId: string) => void;
  onIncreaseSeats: (trip: TripDto) => void;
  actionInProgress?: string | null;
  loading?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onEdit,
  onDelete,
  onIncreaseSeats,
  actionInProgress,
  loading = false
}) => {
  const { t } = useTranslation(['trips', 'common']);
  const [showMap, setShowMap] = useState(false);

  const getStatusBadge = () => {
    const now = new Date();
    const tripDate = trip.dateTime ? new Date(trip.dateTime) : new Date(0);
    
    if (tripDate < now) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {t('trips:status.completed')}
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {t('trips:status.active')}
      </span>
    );
  };

  const getDirectionIcon = () => {
    if (trip.direction === 'TO_SEDE') {
      return '🏢→'; // To headquarters
    } else if (trip.direction === 'FROM_SEDE') {
      return '→🏠'; // From headquarters
    }
    return '🚗'; // Default
  };

  const getSeatsInfo = () => {
    const total = trip.seatsTotal || 0;
    const free = trip.seatsFree || 0;
    const occupied = total - free;
    
    return {
      total,
      free,
      occupied,
      percentage: total > 0 ? Math.round((occupied / total) * 100) : 0
    };
  };

  const seatsInfo = getSeatsInfo();
  const isActionInProgress = actionInProgress === trip.id;

  return (
    <Card className="relative" data-testid={`trip-card-${trip.id}`}>
      <CardContent>
        <div className="space-y-3">
          {/* Header with status and date */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="text-xl">{getDirectionIcon()}</span>
                {t('trips:list.tripTo', { destination: trip.destinationSedeId })}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge()}
                <span className="text-sm text-gray-500">
                  {(() => {
                    const d = trip?.dateTime ? new Date(trip.dateTime) : new Date(0);
                    return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
                  })()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Trip details */}
          <div className="space-y-2 text-sm text-gray-600">
            {(() => {
              const lat = typeof trip?.origin?.lat === 'number' ? trip.origin.lat : 0;
              const lng = typeof trip?.origin?.lng === 'number' ? trip.origin.lng : 0;
              return (
                <p>
                  <strong>{t('trips:labels.origin')}</strong> {lat.toFixed(4)}, {lng.toFixed(4)}
                </p>
              );
            })()}
            <p>
              <strong>{t('trips:labels.destination')}</strong> {trip.destinationSedeId}
            </p>
            <p>
              <strong>{t('trips:labels.time')}</strong> {(() => {
                const d = trip?.dateTime ? new Date(trip.dateTime) : new Date(0);
                return isNaN(d.getTime()) ? '' : d.toLocaleTimeString();
              })()}
            </p>
            
            {/* Enhanced seats information */}
            <div className="flex items-center justify-between">
              <p>
                <strong>{t('trips:labels.seats')}</strong> {t('trips:list.seatsFree', { free: seatsInfo.free, total: seatsInfo.total })}
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${seatsInfo.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{seatsInfo.percentage}%</span>
              </div>
            </div>
          </div>

          {/* Map section */}
          {typeof trip?.origin?.lat === 'number' && typeof trip?.origin?.lng === 'number' && (
            <div className="pt-2">
              {/* Map toggle button */}
              <div className="flex justify-between items-center mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs"
                >
                  {showMap ? t('trips:map.hideMap') : t('trips:map.showMap')}
                </Button>
                {showMap && (
                    <MapLinkButtons
                      lat={trip.origin.lat}
                      lng={trip.origin.lng}
                    />
                )}
              </div>
              
              {/* Map preview (collapsible) */}
              {showMap && (
                <div className="border rounded-lg overflow-hidden">
                  <SimpleMapPreview
                    origin={{ lat: trip.origin.lat, lng: trip.origin.lng }}
                    height={200}
                    interactive={true}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              data-cy={`edit-trip-${trip.id}`}
              onClick={() => onEdit(trip)}
              disabled={isActionInProgress || loading}
            >
              {t('trips:actions.edit')}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              data-cy={`add-seat-${trip.id}`}
              onClick={() => onIncreaseSeats(trip)}
              disabled={isActionInProgress || loading}
              loading={isActionInProgress}
            >
              {t('trips:actions.addSeat')}
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              data-cy={`delete-trip-${trip.id}`}
              onClick={() => onDelete(trip.id)}
              disabled={isActionInProgress || loading}
              loading={isActionInProgress}
            >
              {t('trips:actions.cancel')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
