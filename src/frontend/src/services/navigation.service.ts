/**
 * Navigation Service
 * T-1007-FRONT: API service for fetching adjacent parts (prev/next navigation)
 * 
 * @module services/navigation
 */

import type { AdjacentPartsInfo } from '@/types/modal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch adjacent parts for prev/next navigation
 * 
 * @remarks
 * Integrates with T-1003-BACK GET /api/parts/{id}/navigation endpoint
 * - Supports filter query params (status, tipologia, workshop_id)
 * - Returns prev_id/next_id (null if first/last), current_index, total_count
 * - Backend uses Redis caching (300s TTL, <50ms cache hit)
 * 
 * @param partId - UUID of current part
 * @param filters - Optional filter object to respect user's current filter state
 * @returns Promise resolving to AdjacentPartsInfo
 * @throws Error with user-friendly message on failure
 * 
 * @example
 * ```typescript
 * const navInfo = await getPartNavigation('uuid-123', {
 *   status: ['validated', 'in_fabrication'],
 *   tipologia: ['capitel']
 * });
 * console.log(navInfo.prev_id); // 'uuid-122' or null
 * console.log(`Pieza ${navInfo.current_index} de ${navInfo.total_count}`); // "Pieza 5 de 20"
 * ```
 */
export async function getPartNavigation(
  partId: string,
  filters?: {
    status?: string[];
    tipologia?: string[];
    workshop_id?: string;
  } | null
): Promise<AdjacentPartsInfo> {
  // Construct query params from filters
  const params = new URLSearchParams();
  
  if (filters?.status) {
    filters.status.forEach(s => params.append('status', s));
  }
  if (filters?.tipologia) {
    filters.tipologia.forEach(t => params.append('tipologia', t));
  }
  if (filters?.workshop_id) {
    params.append('workshop_id', filters.workshop_id);
  }
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/parts/${partId}/navigation${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // T-1003-BACK uses X-Workshop-Id for RLS (optional, multi-workshop mode)
        'X-Workshop-Id': getCurrentWorkshopId() || '',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Part not found');
      }
      if (response.status === 403) {
        throw new Error('Access denied');
      }
      throw new Error(`Navigation API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Re-throw with original message
    }
    throw new Error('Failed to fetch navigation data');
  }
}

/**
 * Get current workshop ID from context/storage
 * T-1007: Stub implementation (returns null for single-workshop MVP)
 * 
 * @remarks
 * Future: Extract from auth context or localStorage
 * For MVP (single workshop): returns null → backend uses default workshop
 */
function getCurrentWorkshopId(): string | null {
  // TODO: Implement when multi-workshop support is added
  return null;
}
