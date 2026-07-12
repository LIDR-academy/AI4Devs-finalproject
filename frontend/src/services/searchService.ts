/**
 * Search API service (T029).
 *
 * TanStack Query hooks that wrap the property search and geocode endpoints.
 * Responsibilities:
 *   1. Wrap `apiClient.get("/api/v1/properties/search", { params })` in usePropertySearch hook
 *   2. Wrap `apiClient.get("/api/v1/properties/geocode", { params })` in useGeocode hook
 *   3. Provide automatic caching, retry logic, and error normalization via TanStack Query
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type { SearchFilters, SearchResultsResponse, GeocodeResponse } from '@/types';

/**
 * Hook: Search properties within a bounding box with optional filters.
 * Disabled when params is undefined (no query key change or premature requests).
 *
 * **IMPORTANT**: Parent component MUST memoize the params object using useMemo.
 * If params is recreated on every render, TanStack Query will treat it as a new query key,
 * causing duplicate requests and cache misses.
 *
 * @param params - Search filters (MUST be memoized by parent)
 * @returns Query result with properties, error, isLoading, etc.
 */
export function usePropertySearch(
  params: SearchFilters | undefined,
): UseQueryResult<SearchResultsResponse, Error> {
  return useQuery({
    queryKey: ['propertySearch', params],
    queryFn: async () => {
      if (!params) {
        throw new Error('Search parameters are required');
      }
      const response = await apiClient.get<SearchResultsResponse>(
        '/api/v1/properties/search',
        {
          params,
        },
      );
      return response.data;
    },
    enabled: !!params,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (previously cacheTime)
  });
}

/**
 * Hook: Geocode a location query to coordinates and optional bounding box.
 * Disabled when query is empty (no premature requests).
 *
 * @param query Location search query (e.g., "Barcelona")
 * @returns Query result with geocode results, error, isLoading, etc.
 */
export function useGeocode(query: string): UseQueryResult<GeocodeResponse, Error> {
  return useQuery({
    queryKey: ['geocode', query],
    queryFn: async () => {
      if (!query || query.trim() === '') {
        throw new Error('Geocode query is required');
      }
      const response = await apiClient.get<GeocodeResponse>(
        '/api/v1/properties/geocode',
        {
          params: { q: query },
        },
      );
      return response.data;
    },
    enabled: !!query && query.trim() !== '',
    staleTime: 1000 * 60 * 60, // 1 hour (geocode results are stable)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
