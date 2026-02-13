/**
 * useGenerateMeditation Hook
 * React Query hook for meditation content generation (BC: Generation)
 * 
 * Supports:
 * - Video generation (with imageReference)
 * - Audio/Podcast generation (without imageReference)
 * - Error handling for timeouts and service failures
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  generateMeditationContent,
  GenerationApiError,
  type GenerateMeditationRequest,
  type GenerationResponse,
  GenerationStatus,
} from '@/api/generation-client';

/**
 * Query keys for generation
 */
export const generationKeys = {
  all: ['generation'] as const,
  meditation: (id: string) => [...generationKeys.all, 'meditation', id] as const,
};

/**
 * Generation state machine
 * - idle: Initial state, no generation started
 * - creating: Generation in progress
 * - success: Generation completed successfully
 * - error: Generation failed
 */
export type GenerationState = 'idle' | 'creating' | 'success' | 'error';

/**
 * Hook to generate meditation content
 * 
 * Usage:
 * ```tsx
 * const generation = useGenerateMeditation();
 * 
 * // Start generation
 * generation.mutate({
 *   text: "Breathe deeply...",
 *   musicReference: "music-123",
 *   imageReference: "image-456" // Optional - omit for audio
 * });
 * 
 * // Access state
 * if (generation.isPending) {
 *   return <GenerationStatusBar />;
 * }
 * 
 * if (generation.isSuccess) {
 *   return <a href={generation.data.mediaUrl}>Download</a>;
 * }
 * 
 * if (generation.isError) {
 *   return <ErrorMessage error={generation.error} />;
 * }
 * ```
 */
export function useGenerateMeditation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: GenerateMeditationRequest): Promise<GenerationResponse> => {
      return generateMeditationContent(request);
    },
    onSuccess: (data) => {
      // Cache successful generation result
      if (data.meditationId) {
        queryClient.setQueryData(generationKeys.meditation(data.meditationId), data);
      }
    },
    // Optional: Configure retry behavior for network errors
    retry: (failureCount, error) => {
      // Don't retry on 4xx client errors (validation, timeout)
      if (error instanceof GenerationApiError) {
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
      }
      // Retry 5xx errors up to 2 times
      return failureCount < 2;
    },
  });

  /**
   * Computed state based on mutation status
   */
  const state: GenerationState = mutation.isPending
    ? 'creating'
    : mutation.isSuccess
    ? 'success'
    : mutation.isError
    ? 'error'
    : 'idle';

  /**
   * Progress computation (if backend supports it in the future)
   * For MVP: indeterminate progress while creating
   */
  const progress = mutation.isPending ? undefined : 100;

  /**
   * User-friendly error message
   */
  const errorMessage = mutation.error
    ? getErrorMessage(mutation.error)
    : undefined;

  return {
    // Core mutation interface
    ...mutation,
    
    // Enhanced state
    state,
    progress,
    result: mutation.data,
    errorMessage,
    
    // Convenience methods
    start: mutation.mutate,
    startAsync: mutation.mutateAsync,
    reset: mutation.reset,
    
    // Status flags (for convenience)
    isIdle: state === 'idle',
    isCreating: state === 'creating',
    isCompleted: state === 'success',
    isFailed: state === 'error',
  };
}

/**
 * Extract user-friendly error message from error
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof GenerationApiError) {
    // Map status codes to user-friendly messages
    switch (error.status) {
      case 400:
        return error.errorResponse.message || 'Invalid request. Please check your input.';
      case 408:
        return 'Generation took too long and was cancelled. The content might be too complex. Please try with shorter text.';
      case 503:
        return 'The generation service is temporarily unavailable. Please try again later.';
      default:
        return error.errorResponse.message || 'An unexpected error occurred during generation.';
    }
  }
  
  // Network or other errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Helper hook to check if generation result is ready
 */
export function useIsGenerationReady(result?: GenerationResponse): boolean {
  if (!result) return false;
  return result.status === GenerationStatus.Success && !!result.mediaUrl;
}

/**
 * Helper hook to check if generation has error
 */
export function useHasGenerationError(result?: GenerationResponse): boolean {
  if (!result) return false;
  return (
    result.status === GenerationStatus.ValidationError ||
    result.status === GenerationStatus.ProcessingTimeoutError ||
    result.status === GenerationStatus.ExternalServiceError
  );
}
