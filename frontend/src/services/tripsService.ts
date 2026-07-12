import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type { NormalizedApiError } from './apiClient';
import type {
  BookingDetailResponse,
  CancellationResponse,
  MyTripsResponse,
} from '@/types';

/** Status filter for the My Trips list (matches the backend `status` query param). */
export type TripFilter = 'all' | 'upcoming' | 'past' | 'cancelled';

/** Paginated list of the authenticated guest's trips, filtered by [status]. */
export function useMyTrips(
  status: TripFilter = 'all',
  page = 1,
  size = 10,
): UseQueryResult<MyTripsResponse, NormalizedApiError> {
  return useQuery({
    queryKey: ['myTrips', status, page, size],
    queryFn: async () => {
      const response = await apiClient.get<MyTripsResponse>('/api/v1/bookings/my-trips', {
        params: { status, page, size },
      });
      return response.data;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

/** Full detail for one booking the guest owns. Disabled until [bookingId] is set. */
export function useBookingDetail(
  bookingId: string | undefined,
): UseQueryResult<BookingDetailResponse, NormalizedApiError> {
  return useQuery({
    queryKey: ['bookingDetail', bookingId],
    queryFn: async () => {
      const response = await apiClient.get<BookingDetailResponse>(`/api/v1/bookings/${bookingId}`);
      return response.data;
    },
    enabled: !!bookingId,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export interface CancelBookingVariables {
  bookingId: string;
  reason?: string;
}

/** Cancels a booking; on success invalidates the trips list and this booking's detail. */
export function useCancelBooking(): UseMutationResult<
  CancellationResponse,
  NormalizedApiError,
  CancelBookingVariables
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, reason }: CancelBookingVariables) => {
      const response = await apiClient.post<CancellationResponse>(
        `/api/v1/bookings/${bookingId}/cancel`,
        reason ? { reason } : {},
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myTrips'] });
      queryClient.invalidateQueries({ queryKey: ['bookingDetail', variables.bookingId] });
    },
  });
}
