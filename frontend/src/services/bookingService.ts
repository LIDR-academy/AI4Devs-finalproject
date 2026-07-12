/**
 * Booking API service (Slice B / US3).
 *
 * TanStack Query mutations that wrap the booking creation and confirmation
 * endpoints.  Error handling follows the existing apiClient pattern: every
 * rejected promise is a {@link NormalizedApiError}.
 */

import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type { NormalizedApiError } from './apiClient';
import type {
  CreateBookingRequest,
  CreateBookingResponse,
} from '@/types';
import type {
  ConfirmBookingRequest,
  ConfirmBookingResponse,
} from '@/types/booking';

// --------------------------------------------------------------------------
// bookingHold (Strict-Mode-safe)
// --------------------------------------------------------------------------

/**
 * Query: POST /api/v1/bookings — modelled as a params-keyed query.
 *
 * Creating the availability hold via {@link useQuery} (rather than a
 * mutate-on-mount mutation) makes it survive React Strict Mode's
 * mount → unmount → remount cycle: queries dedupe by key, cache the result,
 * and deliver it to all current subscribers regardless of mount churn.
 * Re-entering checkout with the same params reuses the existing hold instead
 * of creating a duplicate.
 *
 * @param request - the booking hold request, or null when params are missing
 * @param enabled - whether the hold should be created (e.g. auth is ready)
 */
export function useBookingHold(
  request: CreateBookingRequest | null,
  enabled: boolean,
): UseQueryResult<CreateBookingResponse, NormalizedApiError> {
  return useQuery<CreateBookingResponse, NormalizedApiError>({
    queryKey: [
      'bookingHold',
      request?.property_id,
      request?.check_in,
      request?.check_out,
      request?.guest_count,
    ],
    queryFn: async () => {
      const response = await apiClient.post<CreateBookingResponse>(
        '/api/v1/bookings',
        request!,
      );
      return response.data;
    },
    enabled: enabled && request != null,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

// --------------------------------------------------------------------------
// confirmBooking
// --------------------------------------------------------------------------

interface ConfirmBookingVariables {
  bookingId: string;
  payload: ConfirmBookingRequest;
}

/**
 * Mutation: POST /api/v1/bookings/{bookingId}/confirm
 *
 * Confirms a booking by associating the completed Stripe PaymentIntent.
 * Call this after Stripe's `confirmCardPayment` resolves successfully.
 */
export function useConfirmBooking(): UseMutationResult<
  ConfirmBookingResponse,
  NormalizedApiError,
  ConfirmBookingVariables
> {
  return useMutation({
    mutationFn: async ({ bookingId, payload }: ConfirmBookingVariables) => {
      const response = await apiClient.post<ConfirmBookingResponse>(
        `/api/v1/bookings/${bookingId}/confirm`,
        payload,
      );
      return response.data;
    },
  });
}
