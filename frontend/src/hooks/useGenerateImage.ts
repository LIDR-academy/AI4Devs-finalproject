/**
 * useGenerateImage Hook
 * React Query mutation for AI image generation
 * 
 * Error handling: AI unavailable → user-friendly message
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateImage } from '@/api/client';
import { ApiError, type ImageReferenceResponse } from '@/api/types';
import { useComposerStore } from '@/state/composerStore';
import { compositionKeys } from './useComposition';

interface UseGenerateImageOptions {
  compositionId: string | null;
  onSuccess?: (data: ImageReferenceResponse) => void;
  onError?: (error: Error) => void;
}

export function useGenerateImage({ 
  compositionId, 
  onSuccess, 
  onError 
}: UseGenerateImageOptions) {
  const queryClient = useQueryClient();
  const setIsGeneratingImage = useComposerStore((state) => state.setIsGeneratingImage);
  const setAiGeneratedImage = useComposerStore((state) => state.setAiGeneratedImage);
  const setGenerationError = useComposerStore((state) => state.setGenerationError);
  
  return useMutation({
    mutationFn: async () => {
      if (!compositionId) throw new Error('No composition ID');
      return generateImage(compositionId);
    },
    onMutate: () => {
      setIsGeneratingImage(true);
      setGenerationError(null);
    },
    onSuccess: (data) => {
      setIsGeneratingImage(false);
      // Update local state with AI-generated image
      // This triggers output type indicator update (FR-019)
      setAiGeneratedImage(data.imageReference);
      // Invalidate composition and image preview
      queryClient.invalidateQueries({ 
        queryKey: compositionKeys.detail(compositionId!) 
      });
      queryClient.invalidateQueries({ 
        queryKey: compositionKeys.imagePreview(compositionId!) 
      });
      queryClient.invalidateQueries({ 
        queryKey: compositionKeys.outputType(compositionId!) 
      });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      setIsGeneratingImage(false);
      
      // Map errors to user-friendly messages
      let userMessage = 'Failed to generate image. Please try again.';
      
      if (error instanceof ApiError) {
        switch (error.status) {
          case 429:
            userMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          case 503:
            userMessage = 'AI image service is temporarily unavailable. Please try again later.';
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
