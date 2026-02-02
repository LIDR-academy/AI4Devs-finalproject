/**
 * MeditationBuilderPage
 * Main page composing all components for meditation composition
 * 
 * Covers all 8 scenarios:
 * 1. Access Meditation Builder
 * 2. Enter and preserve manual text
 * 3. AI text generation/enhancement
 * 4. AI image generation
 * 5. Output type podcast (without image)
 * 6. Output type video (with image)
 * 7. Preview selected music
 * 8. Preview image
 */

import { useEffect, useCallback, useMemo } from 'react';
import {
  TextEditor,
  OutputTypeIndicator,
  MusicSelector,
  MusicPreview,
  ImagePreview,
  GenerateTextButton,
  GenerateImageButton,
} from '@/components';
import {
  useCreateComposition,
  useUpdateText,
  useSelectMusic,
  useRemoveImage,
  useMusicPreview,
  useImagePreview,
} from '@/hooks';
import { useGenerateText } from '@/hooks/useGenerateText';
import { useGenerateImage } from '@/hooks/useGenerateImage';
import { 
  useComposerStore, 
  useCompositionId, 
  useLocalText,
  useSelectedMusicId,
  useSelectedImageId,
  useGenerationError,
} from '@/state/composerStore';

// Debounce delay for auto-save (ms)
const AUTO_SAVE_DELAY = 1000;

export function MeditationBuilderPage() {
  const compositionId = useCompositionId();
  const localText = useLocalText();
  const selectedMusicId = useSelectedMusicId();
  const selectedImageId = useSelectedImageId();
  const generationError = useGenerationError();
  
  const setCompositionId = useComposerStore((state) => state.setCompositionId);
  const setLocalText = useComposerStore((state) => state.setLocalText);
  const setSelectedMusic = useComposerStore((state) => state.setSelectedMusic);
  const setSelectedImage = useComposerStore((state) => state.setSelectedImage);
  
  // Mutations
  const createComposition = useCreateComposition();
  const updateText = useUpdateText(compositionId);
  const selectMusic = useSelectMusic(compositionId);
  const removeImage = useRemoveImage(compositionId);
  
  // Generate hooks
  const generateText = useGenerateText({ compositionId });
  const generateImage = useGenerateImage({ compositionId });
  
  // Preview queries
  const musicPreview = useMusicPreview(compositionId, !!selectedMusicId);
  const imagePreview = useImagePreview(compositionId, !!selectedImageId);
  
  // Require user to enter text before creating a composition
  const [initialText, setInitialText] = useComposerStore((state) => [state.localText, state.setLocalText]);
  const [textError, setTextError] = useComposerStore((state) => [state.textError, state.setTextError]);

  const handleStart = useCallback(() => {
    if (!initialText || initialText.trim() === '') {
      setTextError('Please enter meditation text to start.');
      return;
    }
    createComposition.mutate(initialText, {
      onSuccess: (data) => {
        setCompositionId(data.id);
        setLocalText(data.textContent);
        if (data.musicReference) setSelectedMusic(data.musicReference);
        if (data.imageReference) setSelectedImage(data.imageReference);
      },
    });
  }, [initialText, createComposition, setCompositionId, setLocalText, setSelectedMusic, setSelectedImage, setTextError]);
  
  // Auto-save text changes (debounced)
  useEffect(() => {
    if (!compositionId || !localText) return;
    
    const timeoutId = setTimeout(() => {
      updateText.mutate({ text: localText });
    }, AUTO_SAVE_DELAY);
    
    return () => clearTimeout(timeoutId);
  }, [localText, compositionId, updateText]);
  
  // Handle music selection
  const handleMusicSelect = useCallback((musicId: string) => {
    selectMusic.mutate({ musicReference: musicId });
  }, [selectMusic]);
  
  // Handle image removal
  const handleImageRemove = useCallback(() => {
    removeImage.mutate();
  }, [removeImage]);
  
  // Handle text generation (Capability 3)
  const handleGenerateText = useCallback(() => {
    generateText.mutate({
      existingText: localText || null,
      context: null,
    });
  }, [generateText, localText]);
  
  // Handle image generation (Capability 4)
  const handleGenerateImage = useCallback(() => {
    generateImage.mutate();
  }, [generateImage]);
  
  // Loading state
  const isInitializing = !compositionId || createComposition.isPending;
  
  // Music preview data
  const musicPreviewData = useMemo(() => ({
    previewUrl: musicPreview.data?.previewUrl,
    musicName: musicPreview.data?.musicReference ?? selectedMusicId ?? 'Selected Track',
  }), [musicPreview.data, selectedMusicId]);
  
  // Image preview data
  const imagePreviewData = useMemo(() => ({
    previewUrl: imagePreview.data?.previewUrl,
    imageName: imagePreview.data?.imageReference ?? selectedImageId ?? 'Selected Image',
  }), [imagePreview.data, selectedImageId]);
  
  if (!compositionId) {
    return (
      <div className="meditation-builder" data-testid="meditation-builder-init">
        <header className="meditation-builder__header">
          <h1>🧘 Meditation Builder</h1>
          <p>Enter your meditation text to begin</p>
        </header>
        <div className="meditation-builder__content">
          <div className="card">
            <h2 className="card__title">Meditation Text</h2>
            <TextEditor 
              disabled={createComposition.isPending}
              placeholder="Enter your meditation text to start..."
            />
            {textError && (
              <div className="meditation-builder__error" role="alert" data-testid="init-error">
                ⚠️ {textError}
              </div>
            )}
            <button 
              className="start-btn"
              onClick={handleStart}
              disabled={createComposition.isPending}
              data-testid="start-btn"
            >
              {createComposition.isPending ? 'Starting...' : 'Start'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="meditation-builder" data-testid="meditation-builder">
      <header className="meditation-builder__header">
        <h1>🧘 Meditation Builder</h1>
        <p>Create your personalized meditation content</p>
      </header>
      
      {/* Error display */}
      {generationError && (
        <div 
          className="meditation-builder__error" 
          role="alert"
          data-testid="generation-error"
        >
          ⚠️ {generationError}
        </div>
      )}
      
      <div className="meditation-builder__content">
        {/* Left column: Text and AI generation */}
        <div className="meditation-builder__left">
          <div className="card">
            <h2 className="card__title">Meditation Text</h2>
            <TextEditor 
              disabled={generateText.isPending}
              placeholder="Enter your meditation text here, or use AI to generate it..."
            />
            <div className="generate-btn-group">
              <GenerateTextButton 
                onGenerate={handleGenerateText}
                isLoading={generateText.isPending}
              />
            </div>
          </div>
          
          <div className="card">
            <h2 className="card__title">Background Music</h2>
            <MusicSelector onSelect={handleMusicSelect} />
            <MusicPreview 
              previewUrl={musicPreviewData.previewUrl}
              musicName={musicPreviewData.musicName}
            />
          </div>
        </div>
        
        {/* Right column: Image and output type */}
        <div className="meditation-builder__right">
          <div className="card">
            <h2 className="card__title">Output Type</h2>
            <OutputTypeIndicator />
          </div>
          
          <div className="card">
            <h2 className="card__title">Visual Content</h2>
            <ImagePreview 
              previewUrl={imagePreviewData.previewUrl}
              imageName={imagePreviewData.imageName}
              onRemove={handleImageRemove}
              disabled={removeImage.isPending}
            />
            <div className="generate-btn-group">
              <GenerateImageButton 
                onGenerate={handleGenerateImage}
                isLoading={generateImage.isPending}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Save indicator */}
      {updateText.isPending && (
        <div className="meditation-builder__save-indicator" data-testid="save-indicator">
          Saving...
        </div>
      )}
    </div>
  );
}

export default MeditationBuilderPage;
