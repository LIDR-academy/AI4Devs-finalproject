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
import { useEffect, useRef } from 'react';
import { 
  generateMeditationContent,
  getMeditationStatus,
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
 * Request with composition ID for context
 */
export interface GenerateMeditationParams {
  request: GenerateMeditationRequest;
  compositionId?: string;
}

/**
 * Hook to generate meditation content
 * 
 * Usage:
 * ```tsx
 * const generation = useGenerateMeditation();
 * 
 * // Start generation
 * generation.mutate({
 *   request: {
 *     text: "Breathe deeply...",
 *     musicReference: "music-123",
 *     imageReference: "image-456" // Optional - omit for audio
 *   },
 *   compositionId: "comp-uuid"
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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ request, compositionId }: GenerateMeditationParams): Promise<GenerationResponse> => {
      return generateMeditationContent(request, compositionId);
    },
    onSuccess: (data) => {
      // Cache successful generation result
      if (data.meditationId) {
        queryClient.setQueryData(generationKeys.meditation(data.meditationId), data);
      }
      
      // Start polling if status is PROCESSING
      if (data.status === GenerationStatus.Processing) {
        startPolling(data.meditationId);
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
   * Poll meditation status until completion or failure
   */
  const startPolling = (meditationId: string) => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await getMeditationStatus(meditationId);
        
        // Update cached data
        queryClient.setQueryData(generationKeys.meditation(meditationId), status);
        
        // Update mutation data to trigger UI updates
        mutation.mutate = mutation.mutate; // Force re-render
        (mutation as any).data = status; // Update internal data
        
        // Stop polling if completed or failed
        if (
          status.status === GenerationStatus.Completed ||
          status.status === GenerationStatus.Failed ||
          status.status === GenerationStatus.Timeout
        ) {
          stopPolling();
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Don't stop polling on network errors, backend might recover
      }
    }, 2000);
  };

  /**
   * Stop polling
   */
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  /**
   * Computed state based on mutation status AND response status
   */
  const isResponseCompleted = mutation.data?.status === GenerationStatus.Completed;
  const isResponseProcessing = mutation.data?.status === GenerationStatus.Processing;
  const isResponseFailed = 
    mutation.data?.status === GenerationStatus.Failed || 
    mutation.data?.status === GenerationStatus.Timeout;

  const state: GenerationState = mutation.isPending || isResponseProcessing
    ? 'creating'
    : isResponseCompleted
    ? 'success'
    : mutation.isError || isResponseFailed
    ? 'error'
    : 'idle';

  /**
   * Progress computation (if backend supports it in the future)
   * For MVP: indeterminate progress while creating
   */
  const progress = (mutation.isPending || isResponseProcessing) ? undefined : 100;

  /**
   * User-friendly error message
   */
  const errorMessage = mutation.error
    ? getErrorMessage(mutation.error)
    : isResponseFailed && mutation.data?.message
    ? mutation.data.message
    : undefined;

  return {
    // Core mutation interface
    ...mutation,
    
    // Enhanced state
    state,
    progress,
    result: isResponseCompleted ? mutation.data : undefined,
    errorMessage,
    
    // Convenience methods
    start: mutation.mutate,
    startAsync: mutation.mutateAsync,
    reset: () => {
      stopPolling();
      mutation.reset();
    },
    
    // Status flags (for convenience)
    isIdle: state === 'idle',
    isCreating: state === 'creating',
    isCompleted: isResponseCompleted,
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
  return result.status === GenerationStatus.Completed && !!result.mediaUrl;
}

/**
 * Helper hook to check if generation has error
 */
export function useHasGenerationError(result?: GenerationResponse): boolean {
  if (!result) return false;
  return (
    result.status === GenerationStatus.Failed ||
    result.status === GenerationStatus.Timeout
  );
}
