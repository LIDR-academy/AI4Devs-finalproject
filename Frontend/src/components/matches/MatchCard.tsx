import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MatchDto } from '../../types/api';
import { Button, Card, CardContent } from '../ui';
import SimpleMapPreview from '../map/SimpleMapPreview';
import MapLinkButtons from '../map/MapLinkButtons';
import ScoreBadge from './ScoreBadge';
import { env } from '../../env';

interface MatchCardProps {
  match: MatchDto;
  isBooked?: boolean;
  isBookingInProgress?: boolean;
  onBook: (match: MatchDto) => void;
  onViewProfile: (driverId: string) => void;
  onRate: (driverId: string) => void;
}

export default function MatchCard({
  match,
  isBooked = false,
  isBookingInProgress = false,
  onBook,
  onViewProfile,
  onRate
}: MatchCardProps) {
  const { t } = useTranslation('matches');
  const [showMap, setShowMap] = useState(false);

  const handleBooking = () => {
    onBook(match);
  };

  const handleViewProfile = () => {
    onViewProfile(match.driverId);
  };

  const handleRate = () => {
    onRate(match.driverId);
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  // Parse coordinates from origin string
  const parseCoordinates = (origin: string) => {
    const parts = (origin || '').split(',').map(s => parseFloat(s.trim()));
    const hasCoords = parts.length === 2 && parts.every(n => !isNaN(n));
    if (!hasCoords) return null;
    return { lat: parts[0], lng: parts[1] };
  };

  const coordinates = parseCoordinates(match.origin);
  const hasValidCoords = coordinates !== null;

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {/* Header with Score and Status */}
          <div className="flex justify-between items-start">
            <div className="flex items-center flex-wrap gap-2">
              <ScoreBadge score={match.score} size="md" />
              {isBooked && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('match.alreadyBooked')}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date(match.dateTime).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(match.dateTime).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              {t('match.tripTo', { destination: match.destinationSedeId })}
            </h3>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>{t('match.origin')}:</strong> {match.origin}</p>
              <p><strong>{t('match.freeSeats')}:</strong> {match.seatsFree}</p>
            </div>

            {/* Map Section */}
            {hasValidCoords && (
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    {t('match.route')}
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleMap}
                  >
                    {showMap ? t('match.hideMap') : t('match.showMap')}
                  </Button>
                </div>
                
                {showMap && (
                  <div className="space-y-2">
                    <SimpleMapPreview
                      origin={coordinates}
                      height={160}
                      interactive={false}
                    />
                    <MapLinkButtons
                      lat={coordinates.lat}
                      lng={coordinates.lng}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Compatibility Reasons */}
            {match.reasons && match.reasons.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  {t('match.compatibilityReasons')}:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {match.reasons.map((reason, index) => (
                    <li key={`${match.id}-reason-${index}`} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleBooking}
              disabled={isBookingInProgress || match.seatsFree === 0 || isBooked}
              loading={isBookingInProgress}
            >
              {match.seatsFree === 0
                ? t('match.noSeatsAvailable')
                : isBooked
                  ? t('match.alreadyBooked')
                  : t('match.book')}
            </Button>
            
            {/* Trust System Buttons */}
            <div className="flex space-x-2 mt-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={handleViewProfile}
              >
                👤 {t('match.viewProfile')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={handleRate}
              >
                ⭐ {t('match.rate')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
