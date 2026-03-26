import { useQuery } from '@tanstack/react-query';
import { getTripById } from '@/services/trip.service';
import type { TripParticipant, TripParticipantDetail } from '@/types/trip.types';

/**
 * Hook to fetch trip participants using React Query
 * Caches participant data for the trip
 */
export function useTripParticipants(tripId: string | undefined) {
  const {
    data: participants,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trip-participants', tripId],
    queryFn: () => {
      if (!tripId) {
        throw new Error('Trip ID is required');
      }
      return getTripById(tripId, { participantsLimit: 100 }).then(trip => {
        const rawParticipants: TripParticipantDetail[] = trip.participants ?? [];

        // Map backend participant detail into TripParticipant shape expected by consumers
        return rawParticipants.map<TripParticipant>(participant => ({
          id: participant.id,
          trip_id: tripId,
          user_id: participant.userId,
          role: participant.role,
          user: participant.user,
        }));
      });
    },
    enabled: !!tripId, // Only fetch if tripId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if tripId is missing
  });

  return {
    participants,
    isLoading,
    error,
    refetch,
  };
}
