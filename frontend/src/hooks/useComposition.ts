/**
 * useComposition Hook
 * React Query hook for server-state (fetch/update composition)
 * Uses auto-generated API client
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createComposition, 
  getComposition, 
  updateText, 
  selectMusic, 
  setImage, 
  removeImage,
  getOutputType,
  previewMusic,
  previewImage,
} from '@/api/client';
import type { 
  CompositionResponse, 
  UpdateTextRequest, 
  SelectMusicRequest, 
  SetImageRequest,
} from '@/api/types';

// Query keys
export const compositionKeys = {
  all: ['compositions'] as const,
  detail: (id: string) => [...compositionKeys.all, id] as const,
  outputType: (id: string) => [...compositionKeys.detail(id), 'output-type'] as const,
  musicPreview: (id: string) => [...compositionKeys.detail(id), 'music-preview'] as const,
  imagePreview: (id: string) => [...compositionKeys.detail(id), 'image-preview'] as const,
};

/**
 * Hook to fetch composition by ID
 */
export function useComposition(compositionId: string | null) {
  return useQuery({
    queryKey: compositionKeys.detail(compositionId ?? ''),
    queryFn: () => getComposition(compositionId!),
    enabled: !!compositionId,
  });
}

/**
 * Hook to create new composition
 */
export function useCreateComposition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (initialText?: string) => createComposition({ text: initialText ?? '' }),
    onSuccess: (data) => {
      queryClient.setQueryData(compositionKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to update composition text
 */
export function useUpdateText(compositionId: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: UpdateTextRequest) => {
      if (!compositionId) throw new Error('No composition ID');
      return updateText(compositionId, request);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(compositionKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to select music
 */
export function useSelectMusic(compositionId: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: SelectMusicRequest) => {
      if (!compositionId) throw new Error('No composition ID');
      return selectMusic(compositionId, request);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(compositionKeys.detail(data.id), data);
      // Invalidate music preview
      queryClient.invalidateQueries({ queryKey: compositionKeys.musicPreview(data.id) });
    },
  });
}

/**
 * Hook to set image
 */
export function useSetImage(compositionId: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: SetImageRequest) => {
      if (!compositionId) throw new Error('No composition ID');
      return setImage(compositionId, request);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(compositionKeys.detail(data.id), data);
      // Invalidate image preview and output type
      queryClient.invalidateQueries({ queryKey: compositionKeys.imagePreview(data.id) });
      queryClient.invalidateQueries({ queryKey: compositionKeys.outputType(data.id) });
    },
  });
}

/**
 * Hook to remove image
 */
export function useRemoveImage(compositionId: string | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      if (!compositionId) throw new Error('No composition ID');
      return removeImage(compositionId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(compositionKeys.detail(data.id), data);
      // Invalidate output type
      queryClient.invalidateQueries({ queryKey: compositionKeys.outputType(data.id) });
    },
  });
}

/**
 * Hook to get output type
 */
export function useOutputType(compositionId: string | null) {
  return useQuery({
    queryKey: compositionKeys.outputType(compositionId ?? ''),
    queryFn: () => getOutputType(compositionId!),
    enabled: !!compositionId,
  });
}

/**
 * Hook to get music preview
 */
export function useMusicPreview(compositionId: string | null, enabled = true) {
  return useQuery({
    queryKey: compositionKeys.musicPreview(compositionId ?? ''),
    queryFn: () => previewMusic(compositionId!),
    enabled: !!compositionId && enabled,
    retry: false, // Don't retry if no music selected
  });
}

/**
 * Hook to get image preview
 */
export function useImagePreview(compositionId: string | null, enabled = true) {
  return useQuery({
    queryKey: compositionKeys.imagePreview(compositionId ?? ''),
    queryFn: () => previewImage(compositionId!),
    enabled: !!compositionId && enabled,
    retry: false, // Don't retry if no image selected
  });
}
