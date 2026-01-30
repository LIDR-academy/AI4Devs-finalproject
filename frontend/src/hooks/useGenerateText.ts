/**
 * useGenerateText Hook
 * React Query mutation for AI text generation/enhancement
 * 
 * Works with empty field, keywords, or existing content (unified).
 * Error handling: AI unavailable → user-friendly message
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateText } from '@/api/client';
import { ApiError, type GenerateTextRequest, type TextContentResponse } from '@/api/types';
import { useComposerStore } from '@/state/composerStore';
import { compositionKeys } from './useComposition';

interface UseGenerateTextOptions {
  compositionId: string | null;
  onSuccess?: (data: TextContentResponse) => void;
  onError?: (error: Error) => void;
}

export function useGenerateText({ 
  compositionId, 
  onSuccess, 
  onError 
}: UseGenerateTextOptions) {
  const queryClient = useQueryClient();
  const setIsGeneratingText = useComposerStore((state) => state.setIsGeneratingText);
  const setLocalText = useComposerStore((state) => state.setLocalText);
  const setGenerationError = useComposerStore((state) => state.setGenerationError);
  
  return useMutation({
    mutationFn: async (request?: GenerateTextRequest) => {
      if (!compositionId) throw new Error('No composition ID');
      return generateText(compositionId, request);
    },
    onMutate: () => {
      setIsGeneratingText(true);
      setGenerationError(null);
    },
    onSuccess: (data) => {
      setIsGeneratingText(false);
      // Update local text with generated content
      setLocalText(data.text);
      // Invalidate composition to refresh server state
      queryClient.invalidateQueries({ 
        queryKey: compositionKeys.detail(compositionId!) 
      });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      setIsGeneratingText(false);
      
      // Map errors to user-friendly messages
      let userMessage = 'Failed to generate text. Please try again.';
      
      if (error instanceof ApiError) {
        switch (error.status) {
          case 429:
            userMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          case 503:
            userMessage = 'AI service is temporarily unavailable. Please try again later.';
            break;
          default:
            userMessage = error.errorResponse.message;
        }
      }
      
      setGenerationError(userMessage);
      onError?.(error);
    },
  });
}
