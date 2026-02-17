/**
 * usePlaybackInfo Hook
 * 
 * React Query hook for fetching playback information for a specific meditation.
 * 
 * Features:
 * - Lazy loading (only fetches when meditationId provided)
 * - Handles 404 (meditation not found)
 * - Handles 409 (meditation not playable)
 * - User-friendly error messages in Spanish
 * - Type-safe with generated OpenAPI client
 * 
 * Business Rules:
 * - Only COMPLETED meditations return playback info
 * - Returns 409 if meditation is PENDING, PROCESSING, or FAILED
 */

import { useQuery } from '@tanstack/react-query';
import { Configuration, PlaybackApi, PlaybackInfoResponse } from '../../api/generated/playback/src';

/**
 * API Configuration
 * TODO: Replace with actual auth token from authentication context (US1)
 */
const getApiConfig = (): Configuration => {
  return new Configuration({
    basePath: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    headers: {
      // Temporary: X-User-Id header until US1 implements JWT
      'X-User-Id': import.meta.env.VITE_USER_ID || '123e4567-e89b-12d3-a456-426614174000'
    }
  });
};

/**
 * Fetches playback information for a meditation.
 * Throws user-friendly errors for 404/409 responses.
 */
const fetchPlaybackInfo = async (meditationId: string): Promise<PlaybackInfoResponse> => {
  const api = new PlaybackApi(getApiConfig());
  
  try {
    const response = await api.getPlaybackInfo({ meditationId });
    return response;
  } catch (error: any) {
    // Parse backend error responses
    if (error.status === 404 || error.response?.status === 404) {
      throw new Error('Meditación no encontrada');
    }
    
    if (error.status === 409 || error.response?.status === 409) {
      // Extract user message from backend ErrorResponse
      const errorData = error.response?.data || error.body || {};
      const message = errorData.message || 
        'Esta meditación aún se está procesando. Por favor, espera a que esté lista.';
      throw new Error(message);
    }
    
    console.error('Error fetching playback info:', error);
    throw new Error('Error al obtener información de reproducción');
  }
};

/**
 * usePlaybackInfo Hook
 * 
 * Fetches playback information for a specific meditation.
 * 
 * @param meditationId - UUID of the meditation (null to disable query)
 * @returns React Query result with:
 *   - data: PlaybackInfoResponse | undefined
 *   - isLoading: boolean
 *   - error: Error | null
 *   - refetch: () => void
 * 
 * @example
 * ```tsx
 * function PlayerPage({ meditationId }) {
 *   const { data, isLoading, error } = usePlaybackInfo(meditationId);
 *   
 *   if (isLoading) return <p>Cargando...</p>;
 *   if (error) return <p>{error.message}</p>;
 *   
 *   return <MeditationPlayer mediaUrls={data?.mediaUrls} />;
 * }
 * ```
 */
export const usePlaybackInfo = (meditationId: string | null) => {
  return useQuery({
    queryKey: ['meditations', 'playback', meditationId],
    queryFn: () => {
      if (!meditationId) {
        throw new Error('Meditation ID is required');
      }
      return fetchPlaybackInfo(meditationId);
    },
    enabled: !!meditationId, // Only fetch if meditationId provided
    staleTime: 1000 * 60 * 10,  // 10 minutes (playback info rarely changes)
    gcTime: 1000 * 60 * 15,      // 15 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus (media URLs are semi-stable)
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 409 (client errors)
      if (error?.status === 404 || error?.status === 409) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    throwOnError: false
  });
};

export default usePlaybackInfo;
