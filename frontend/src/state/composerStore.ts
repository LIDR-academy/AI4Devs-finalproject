/**
 * Composer Store (Zustand)
 * UI state management for Meditation Builder
 * 
 * NO server state - that's managed by React Query
 * Only UI-specific state: local text edits, selections, loading states
 */

import { create } from 'zustand';
import type { OutputType } from '@/api/types';

// Available music tracks (would come from media catalog in real app)
export interface MusicTrack {
  id: string;
  name: string;
  duration: string;
}

// Available images (would come from media catalog in real app)
export interface ImageOption {
  id: string;
  name: string;
  thumbnailUrl: string;
}

interface ComposerState {
  // Current composition ID
  compositionId: string | null;
  
  // Local text editing state (not server state)
  localText: string;
  
  // Selected references
  selectedMusicId: string | null;
  selectedImageId: string | null;
  
  // AI generation state
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  
  // Preview states
  isMusicPlaying: boolean;
  
  // Output type (derived but cached for instant UI update)
  outputType: OutputType;
  
  // Error states
  textError: string | null;
  generationError: string | null;
  
  // Actions
  setCompositionId: (id: string | null) => void;
  setLocalText: (text: string) => void;
  setSelectedMusic: (musicId: string | null) => void;
  setSelectedImage: (imageId: string | null) => void;
  setIsGeneratingText: (isGenerating: boolean) => void;
  setIsGeneratingImage: (isGenerating: boolean) => void;
  setIsMusicPlaying: (isPlaying: boolean) => void;
  setTextError: (error: string | null) => void;
  setGenerationError: (error: string | null) => void;
  
  // Compound actions
  clearImage: () => void;
  setAiGeneratedImage: (imageId: string) => void;
  updateOutputType: (type: OutputType) => void;
  reset: () => void;
}

const MAX_TEXT_LENGTH = 10000;

const initialState = {
  compositionId: null,
  localText: '',
  selectedMusicId: null,
  selectedImageId: null,
  isGeneratingText: false,
  isGeneratingImage: false,
  isMusicPlaying: false,
  outputType: 'PODCAST' as OutputType,
  textError: null,
  generationError: null,
};

export const useComposerStore = create<ComposerState>((set) => ({
  ...initialState,
  
  setCompositionId: (id) => set({ compositionId: id }),
  
  setLocalText: (text) => {
    // Preserve text exactly as typed (domain invariant mirrored in UI)
    if (text.length > MAX_TEXT_LENGTH) {
      set({ 
        textError: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`,
      });
      return;
    }
    set({ 
      localText: text,
      textError: null,
    });
  },
  
  setSelectedMusic: (musicId) => set({ selectedMusicId: musicId }),
  
  setSelectedImage: (imageId) => {
    set({ 
      selectedImageId: imageId,
      outputType: imageId ? 'VIDEO' : 'PODCAST'
    });
  },
  
  setIsGeneratingText: (isGenerating) => set({ isGeneratingText: isGenerating }),
  
  setIsGeneratingImage: (isGenerating) => set({ isGeneratingImage: isGenerating }),
  
  setIsMusicPlaying: (isPlaying) => set({ isMusicPlaying: isPlaying }),
  
  setTextError: (error) => set({ textError: error }),
  
  setGenerationError: (error) => set({ generationError: error }),
  
  clearImage: () => {
    set({ 
      selectedImageId: null,
      outputType: 'PODCAST'
    });
  },
  
  setAiGeneratedImage: (imageId) => {
    set({ 
      selectedImageId: imageId,
      outputType: imageId ? 'VIDEO' : 'PODCAST'
    });
  },
  
   updateOutputType: (type: OutputType) => {
     set({ outputType: type });
   },
  
  reset: () => set(initialState),
}));

// Selector hooks for optimized rerenders
export const useCompositionId = () => useComposerStore((state) => state.compositionId);
export const useLocalText = () => useComposerStore((state) => state.localText);
export const useSelectedMusicId = () => useComposerStore((state) => state.selectedMusicId);
export const useSelectedImageId = () => useComposerStore((state) => state.selectedImageId);
export const useIsGeneratingText = () => useComposerStore((state) => state.isGeneratingText);
export const useIsGeneratingImage = () => useComposerStore((state) => state.isGeneratingImage);
export const useIsMusicPlaying = () => useComposerStore((state) => state.isMusicPlaying);
export const useOutputType = () => useComposerStore((state) => state.outputType);
export const useTextError = () => useComposerStore((state) => state.textError);
export const useGenerationError = () => useComposerStore((state) => state.generationError);
