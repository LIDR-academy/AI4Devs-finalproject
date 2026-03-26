import { Map as MapIcon, Users as UsersIcon, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TripResponse, TripListItem, TripCurrency } from '@/types/trip.types';
import { formatRelativeDate } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';

interface TripCardProps {
  trip?: TripResponse;
  onClick?: () => void;
  isLoading?: boolean;
}

/**
 * Type guard to check if a trip has the extended TripListItem properties
 */
function isTripListItem(trip: TripResponse): trip is TripListItem {
  return 'participantCount' in trip;
}

/**
 * Get participant count from trip data
 * @param trip - Trip data (may be TripResponse or TripListItem)
 * @returns Number of participants (defaults to 1 for creator if count not available)
 */
function getParticipantCount(trip: TripResponse): number {
  return isTripListItem(trip) ? trip.participantCount : 1; // Default to 1 (creator)
}

/**
 * TripCard molecule component
 * Displays trip information in a card format
 * Follows Design System Guide: rounded-xl, shadow-md, microinteraction scale-98
 * Uses semantic Link element for accessibility
 *
 * @param trip - Trip data to display (optional if isLoading is true)
 * @param onClick - Optional click handler (if provided, uses button instead of Link)
 * @param isLoading - If true, shows skeleton loading state
 */
export const TripCard = ({ trip, onClick, isLoading = false }: TripCardProps) => {
  // Skeleton loading state
  if (isLoading || !trip) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md animate-pulse">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-5 h-5 bg-slate-200 rounded flex-shrink-0 mt-0.5" />
          <div className="h-6 bg-slate-200 rounded flex-1" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-4 bg-slate-200 rounded w-28" />
        </div>
      </div>
    );
  }

  const participantCount = getParticipantCount(trip);
  const totalAmount = trip.totalAmount ?? 0;
  const trip_currency = (trip.currency as TripCurrency) || 'COP';

  const cardContent = (
    <div className="bg-white rounded-xl p-6 shadow-md active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-violet-600 focus-visible:outline-offset-2">
      <div className="flex items-start gap-3 mb-4">
        <MapIcon className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <h3 className="text-lg font-heading font-semibold text-slate-900 flex-1">{trip.name}</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <UsersIcon className="w-4 h-4" aria-hidden="true" />
          <span>
            {participantCount} {participantCount === 1 ? 'participante' : 'participantes'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-900">
            {formatCurrency(totalAmount, trip_currency)}
          </span>
          <span className="text-xs text-slate-500">({trip_currency})</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarIcon className="w-4 h-4" aria-hidden="true" />
          <span>{formatRelativeDate(trip.createdAt)}</span>
        </div>
      </div>
    </div>
  );

  // If onClick is provided, use button wrapper, otherwise use Link
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left focus-visible:outline-2 focus-visible:outline-violet-600 focus-visible:outline-offset-2 rounded-xl"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="block focus-visible:outline-2 focus-visible:outline-violet-600 focus-visible:outline-offset-2 rounded-xl"
    >
      {cardContent}
    </Link>
  );
};
