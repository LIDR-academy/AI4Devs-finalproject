/**
 * useGenerateImage Hook
 * React Query mutation for AI image generation
 * 
 * Error handling: AI unavailable → user-friendly message
 */


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageReferenceResponse, ApiError } from '@/api/types';
import { useComposerStore } from '@/state/composerStore';

interface UseGenerateImageOptions {
  prompt?: string;
  onSuccess?: (data: ImageReferenceResponse) => void;
  onError?: (error: Error) => void;
}

export function useGenerateImage({ prompt, onSuccess, onError }: UseGenerateImageOptions) {
  const queryClient = useQueryClient();
  const setIsGeneratingImage = useComposerStore((state) => state.setIsGeneratingImage);
  const setAiGeneratedImage = useComposerStore((state) => state.setAiGeneratedImage);
  const setGenerationError = useComposerStore((state) => state.setGenerationError);

  return useMutation({
    mutationFn: async (promptOverride?: string) => {
      const textPrompt = promptOverride ?? prompt;
      if (!textPrompt) throw new Error('No prompt provided');
      const response = await fetch('${import.meta.env.VITE_API_BASE_URL}/api/v1/compositions/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: textPrompt,
      });
      if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = { error: 'UNKNOWN_ERROR', message: response.statusText, timestamp: new Date().toISOString() };
        }
        throw new ApiError(response.status, errorBody);
      }
      const data = await response.json();
      return { imageReference: data.imageReference } as ImageReferenceResponse;
    },
    onMutate: () => {
      setIsGeneratingImage(true);
      setGenerationError(null);
    },
    onSuccess: (data) => {
      setIsGeneratingImage(false);
      setAiGeneratedImage(data.imageReference);
      queryClient.invalidateQueries();
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      setIsGeneratingImage(false);
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
