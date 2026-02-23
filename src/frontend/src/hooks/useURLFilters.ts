/**
 * useURLFilters Hook
 * 
 * T-0506-FRONT: URL params synchronization with Zustand store
 * 
 * @module useURLFilters
 */

import { useEffect } from 'react';
import { usePartsStore } from '@/stores/parts.store';
import type { PartsFilters } from '@/stores/parts.store';
import { FILTER_URL_PARAMS } from '@/constants/parts.constants';

/**
 * Build URL query string from filters object
 * 
 * Encoding strategy: Manual concatenation to preserve unencoded commas
 * for deep-linking (e.g., status=validated,uploaded)
 * 
 * @param filters - Current filter state
 * @returns Query string with '?' prefix, or empty pathname if no filters
 * 
 * @example
 * ```typescript
 * buildFilterURLString({
 *   status: ['validated', 'uploaded'],
 *   tipologia: ['capitel'],
 *   workshop_id: null
 * })
 * // Returns: '?status=validated,uploaded&tipologia=capitel'
 * ```
 */
function buildFilterURLString(filters: PartsFilters): string {
  const parts: string[] = [];

  // Add status if not empty (comma-separated, unencoded)
  if (filters.status.length > 0) {
    parts.push(
      `${FILTER_URL_PARAMS.STATUS}=${filters.status.join(FILTER_URL_PARAMS.SEPARATOR)}`
    );
  }

  // Add tipologia if not empty (comma-separated, unencoded)
  if (filters.tipologia.length > 0) {
    parts.push(
      `${FILTER_URL_PARAMS.TIPOLOGIA}=${filters.tipologia.join(FILTER_URL_PARAMS.SEPARATOR)}`
    );
  }

  // Add workshop_id if not null
  if (filters.workshop_id) {
    parts.push(`${FILTER_URL_PARAMS.WORKSHOP}=${filters.workshop_id}`);
  }

  // Return query string with '?' or just pathname
  return parts.length > 0 ? `?${parts.join('&')}` : window.location.pathname;
}

/**
 * Parse URL params into filters object
 * 
 * @param searchParams - URLSearchParams object from window.location.search
 * @returns Filters object with arrays for status/tipologia, nullable workshop_id
 * 
 * @example
 * ```typescript
 * const params = new URLSearchParams('?status=validated,uploaded');
 * parseURLToFilters(params);
 * // Returns: { status: ['validated', 'uploaded'], tipologia: [], workshop_id: null }
 * ```
 */
function parseURLToFilters(searchParams: URLSearchParams): PartsFilters {
  const statusParam = searchParams.get(FILTER_URL_PARAMS.STATUS);
  const tipologiaParam = searchParams.get(FILTER_URL_PARAMS.TIPOLOGIA);
  const workshopParam = searchParams.get(FILTER_URL_PARAMS.WORKSHOP);

  return {
    status: statusParam ? statusParam.split(FILTER_URL_PARAMS.SEPARATOR) : [],
    tipologia: tipologiaParam ? tipologiaParam.split(FILTER_URL_PARAMS.SEPARATOR) : [],
    workshop_id: workshopParam || null,
  };
}

/**
 * useURLFilters: Bidirectional sync between URL params and store filters
 * 
 * On mount: Reads URL params → setFilters()
 * On store change: Updates URL with window.history.replaceState()
 * 
 * URL encoding:
 * - Arrays: comma-separated (status=validated,uploaded)
 * - Single values: plain string (workshop_id=uuid)
 * - Empty arrays: param omitted from URL
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   useURLFilters(); // Auto-sync filters
 *   return <Canvas3D />;
 * }
 * ```
 */
export function useURLFilters() {
  const { filters, setFilters } = usePartsStore();

  // URL → Store (on mount only)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilters = parseURLToFilters(params);
    setFilters(urlFilters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Store → URL (reactive)
  useEffect(() => {
    const queryString = buildFilterURLString(filters);
    window.history.replaceState({}, '', queryString);
  }, [filters]);
}
