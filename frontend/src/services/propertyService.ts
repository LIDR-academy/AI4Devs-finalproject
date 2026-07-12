/**
 * Property Details API service (T042).
 *
 * TanStack Query hooks that wrap the property detail, availability,
 * reviews, and price calculation endpoints.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type {
  Property,
  AvailabilityResponse,
  ReviewsResponse,
  PriceBreakdownResponse,
} from '@/types';

/**
 * Hook: Fetch full property details by ID.
 * Disabled when id is empty.
 *
 * @param id - Property UUID
 */
export function usePropertyDetails(id: string): UseQueryResult<Property, Error> {
  return useQuery({
    queryKey: ['propertyDetails', id],
    queryFn: async () => {
      const response = await apiClient.get<Property>(`/api/v1/properties/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook: Fetch property availability calendar for a date range.
 * Disabled when id, from, or to are empty.
 *
 * @param id   - Property UUID
 * @param from - Start date "YYYY-MM-DD" (inclusive)
 * @param to   - End date "YYYY-MM-DD" (inclusive)
 */
export function usePropertyAvailability(
  id: string,
  from: string,
  to: string,
): UseQueryResult<AvailabilityResponse, Error> {
  return useQuery({
    queryKey: ['propertyAvailability', id, from, to],
    queryFn: async () => {
      const response = await apiClient.get<AvailabilityResponse>(
        `/api/v1/properties/${id}/availability`,
        { params: { from, to } },
      );
      return response.data;
    },
    enabled: !!id && !!from && !!to,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook: Fetch paginated reviews for a property.
 * Disabled when id is empty.
 *
 * @param id   - Property UUID
 * @param page - Page number (1-based)
 * @param size - Page size
 */
export function usePropertyReviews(
  id: string,
  page: number,
  size: number,
): UseQueryResult<ReviewsResponse, Error> {
  return useQuery({
    queryKey: ['propertyReviews', id, page, size],
    queryFn: async () => {
      const response = await apiClient.get<ReviewsResponse>(
        `/api/v1/properties/${id}/reviews`,
        { params: { page, size } },
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook: Calculate total price for a stay.
 * Disabled when id, checkIn, or checkOut are empty.
 *
 * @param id       - Property UUID
 * @param checkIn  - Check-in date "YYYY-MM-DD"
 * @param checkOut - Check-out date "YYYY-MM-DD"
 * @param guests   - Guest count (default 1)
 */
export function usePriceCalculation(
  id: string,
  checkIn: string | undefined,
  checkOut: string | undefined,
  guests: number = 1,
): UseQueryResult<PriceBreakdownResponse, Error> {
  return useQuery({
    queryKey: ['priceCalculation', id, checkIn, checkOut, guests],
    queryFn: async () => {
      const response = await apiClient.get<PriceBreakdownResponse>(
        `/api/v1/properties/${id}/price`,
        { params: { check_in: checkIn, check_out: checkOut, guests } },
      );
      return response.data;
    },
    enabled: !!id && !!checkIn && !!checkOut,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
