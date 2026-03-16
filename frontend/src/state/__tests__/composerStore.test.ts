/**
 * composerStore Tests
 * Verifies Zustand store behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useComposerStore } from '@/state/composerStore';

describe('composerStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useComposerStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have null compositionId initially', () => {
      expect(useComposerStore.getState().compositionId).toBeNull();
    });

    it('should have empty localText initially', () => {
      expect(useComposerStore.getState().localText).toBe('');
    });

    it('should have PODCAST as initial outputType', () => {
      expect(useComposerStore.getState().outputType).toBe('PODCAST');
    });

    it('should have no selected music initially', () => {
      expect(useComposerStore.getState().selectedMusicId).toBeNull();
    });

    it('should have no selected image initially', () => {
      expect(useComposerStore.getState().selectedImageId).toBeNull();
    });
  });

  describe('Text Actions', () => {
    it('should set local text', () => {
      useComposerStore.getState().setLocalText('Hello meditation');
      expect(useComposerStore.getState().localText).toBe('Hello meditation');
    });

    it('should preserve text exactly (no transformation)', () => {
      const specialText = '   Breathe deeply...\n\n🧘 Namaste!  ';
      useComposerStore.getState().setLocalText(specialText);
      expect(useComposerStore.getState().localText).toBe(specialText);
    });

    it('should set error when text exceeds max length', () => {
      const longText = 'a'.repeat(10001);
      useComposerStore.getState().setLocalText(longText);
      expect(useComposerStore.getState().textError).toContain('exceeds maximum length');
    });

    it('should clear error when text is within limit', () => {
      useComposerStore.getState().setTextError('Some error');
      useComposerStore.getState().setLocalText('Valid text');
      expect(useComposerStore.getState().textError).toBeNull();
    });
  });

  describe('Music Actions', () => {
    it('should set selected music', () => {
      useComposerStore.getState().setSelectedMusic('calm-ocean-waves');
      expect(useComposerStore.getState().selectedMusicId).toBe('calm-ocean-waves');
    });

    it('should clear selected music', () => {
      useComposerStore.getState().setSelectedMusic('calm-ocean-waves');
      useComposerStore.getState().setSelectedMusic(null);
      expect(useComposerStore.getState().selectedMusicId).toBeNull();
    });
  });

  describe('Image Actions', () => {
    it('should set selected image', () => {
      useComposerStore.getState().setSelectedImage('sunset-beach-001');
      expect(useComposerStore.getState().selectedImageId).toBe('sunset-beach-001');
    });

    it('should update outputType to VIDEO when image is set', () => {
      useComposerStore.getState().setSelectedImage('sunset-beach-001');
      expect(useComposerStore.getState().outputType).toBe('VIDEO');
    });

    it('should clear image', () => {
      useComposerStore.getState().setSelectedImage('sunset-beach-001');
      useComposerStore.getState().clearImage();
      expect(useComposerStore.getState().selectedImageId).toBeNull();
    });

    it('should update outputType to PODCAST when image is cleared', () => {
      useComposerStore.getState().setSelectedImage('sunset-beach-001');
      useComposerStore.getState().clearImage();
      expect(useComposerStore.getState().outputType).toBe('PODCAST');
    });

    it('should handle AI-generated image', () => {
      useComposerStore.getState().setAiGeneratedImage('ai-generated-12345');
      expect(useComposerStore.getState().selectedImageId).toBe('ai-generated-12345');
      expect(useComposerStore.getState().outputType).toBe('VIDEO');
    });
  });

  describe('Output Type (FR-019)', () => {
    it('should be PODCAST when no image selected', () => {
      expect(useComposerStore.getState().outputType).toBe('PODCAST');
    });

    it('should be VIDEO when manual image selected', () => {
      useComposerStore.getState().setSelectedImage('manual-image-001');
      expect(useComposerStore.getState().outputType).toBe('VIDEO');
    });

    it('should be VIDEO when AI image generated', () => {
      useComposerStore.getState().setAiGeneratedImage('ai-image-001');
      expect(useComposerStore.getState().outputType).toBe('VIDEO');
    });

    it('should update immediately when image added', () => {
      expect(useComposerStore.getState().outputType).toBe('PODCAST');
      useComposerStore.getState().setSelectedImage('image-001');
      expect(useComposerStore.getState().outputType).toBe('VIDEO');
    });

    it('should update immediately when image removed', () => {
      useComposerStore.getState().setSelectedImage('image-001');
      expect(useComposerStore.getState().outputType).toBe('VIDEO');
      useComposerStore.getState().clearImage();
      expect(useComposerStore.getState().outputType).toBe('PODCAST');
    });
  });

  describe('Generation States', () => {
    it('should track text generation state', () => {
      expect(useComposerStore.getState().isGeneratingText).toBe(false);
      useComposerStore.getState().setIsGeneratingText(true);
      expect(useComposerStore.getState().isGeneratingText).toBe(true);
    });

    it('should track image generation state', () => {
      expect(useComposerStore.getState().isGeneratingImage).toBe(false);
      useComposerStore.getState().setIsGeneratingImage(true);
      expect(useComposerStore.getState().isGeneratingImage).toBe(true);
    });
  });

  describe('Music Playing State', () => {
    it('should track music playing state', () => {
      expect(useComposerStore.getState().isMusicPlaying).toBe(false);
      useComposerStore.getState().setIsMusicPlaying(true);
      expect(useComposerStore.getState().isMusicPlaying).toBe(true);
    });
  });

  describe('Error States', () => {
    it('should set and clear generation error', () => {
      useComposerStore.getState().setGenerationError('AI service unavailable');
      expect(useComposerStore.getState().generationError).toBe('AI service unavailable');
      
      useComposerStore.getState().setGenerationError(null);
      expect(useComposerStore.getState().generationError).toBeNull();
    });
  });

  describe('Reset', () => {
    it('should reset all state to initial values', () => {
      // Set some state
      useComposerStore.getState().setCompositionId('comp-123');
      useComposerStore.getState().setLocalText('Some text');
      useComposerStore.getState().setSelectedMusic('music-001');
      useComposerStore.getState().setSelectedImage('image-001');
      useComposerStore.getState().setIsGeneratingText(true);
      
      // Reset
      useComposerStore.getState().reset();
      
      // Verify initial state
      expect(useComposerStore.getState().compositionId).toBeNull();
      expect(useComposerStore.getState().localText).toBe('');
      expect(useComposerStore.getState().selectedMusicId).toBeNull();
      expect(useComposerStore.getState().selectedImageId).toBeNull();
      expect(useComposerStore.getState().isGeneratingText).toBe(false);
      expect(useComposerStore.getState().outputType).toBe('PODCAST');
    });
  });
});
