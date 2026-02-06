import { useEffect, useMemo } from 'react';
import {
  TextEditor,
  OutputTypeIndicator,
  MusicSelector,
  MusicPreview,
  ImagePreview,
  GenerateTextButton,
  GenerateImageButton,
} from '@/components';
import ImageSelectorButton from '@/components/ImageSelectorButton';
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

const AUTO_SAVE_DELAY = 1000;

import React, { useState, useCallback } from 'react';

export function MeditationBuilderPage() {
  const compositionId = useCompositionId();
  const localText = useLocalText();
  const selectedMusicId = useSelectedMusicId();
  const selectedImageId = useSelectedImageId();
  const generationError = useGenerationError();

  const setCompositionId = useComposerStore((s) => s.setCompositionId);
  const setLocalText = useComposerStore((s) => s.setLocalText);
  const setSelectedMusic = useComposerStore((s) => s.setSelectedMusic);
  const setSelectedImage = useComposerStore((s) => s.setSelectedImage);


  const createComposition = useCreateComposition();
  const updateText = useUpdateText(compositionId);
  const selectMusic = useSelectMusic(compositionId);
  const removeImage = useRemoveImage(compositionId);

  const generateText = useGenerateText({ compositionId });
  const generateImage = useGenerateImage({ prompt: localText });

  const musicPreview = useMusicPreview(compositionId, !!selectedMusicId);
  const imagePreview = useImagePreview(compositionId, !!selectedImageId);



  useEffect(() => {
    if (!compositionId) return;
    const t = setTimeout(() => {
      updateText.mutate({ text: localText });
    }, AUTO_SAVE_DELAY);
    return () => clearTimeout(t);
  }, [localText, compositionId]);

  const musicPreviewData = useMemo(() => ({
    previewUrl: musicPreview.data?.previewUrl,
    musicName: musicPreview.data?.musicReference ?? selectedMusicId ?? '',
  }), [musicPreview.data, selectedMusicId]);


  // Estado local para preview de imagen seleccionada
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [localImageName, setLocalImageName] = useState<string>('');

  const imagePreviewData = useMemo(() => {
    if (localImageUrl) {
      return {
        previewUrl: localImageUrl,
        imageName: localImageName,
      };
    }
    return {
      previewUrl: imagePreview.data?.previewUrl,
      imageName: imagePreview.data?.imageReference ?? selectedImageId ?? '',
    };
  }, [localImageUrl, localImageName, imagePreview.data, selectedImageId]);

  // Limpieza de URL local
  const handleImageSelected = useCallback((file: File) => {
    if (localImageUrl) {
      URL.revokeObjectURL(localImageUrl);
    }
    const url = URL.createObjectURL(file);
    setLocalImageUrl(url);
    setLocalImageName(file.name);
  }, [localImageUrl]);

  // Limpieza al desmontar
  React.useEffect(() => {
    return () => {
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
      }
    };
  }, [localImageUrl]);

useEffect(() => {
  if (compositionId) return;

  createComposition.mutate('', {
    onSuccess: (data) => {
      setCompositionId(data.id);
      setLocalText(data.textContent ?? '');
      if (data.musicReference) setSelectedMusic(data.musicReference);
      if (data.imageReference) setSelectedImage(data.imageReference);
    },
  });
}, [compositionId]);

  // ⬇️ PANTALLA PRINCIPAL
  return (
  <div className="meditation-builder" data-testid="meditation-builder">
    <header className="meditation-builder__header">
      <h1>🧘 Meditation Builder</h1>
      <p>Create your personalized meditation content</p>
    </header>

    {generationError && (
      <div role="alert">⚠️ {generationError}</div>
    )}

    <div className="meditation-builder__content">
      {/* Left column */}
      <div className="meditation-builder__left">
        <div className="card">
          <h2 className="card__title">Meditation Text</h2>
          <TextEditor
            disabled={generateText.isPending}
            placeholder="Enter your meditation text here, or use AI to generate it..."
          />
          <div className="generate-btn-group">
            <GenerateTextButton
              onGenerate={() =>
                generateText.mutate({ existingText: localText })
              }
              isLoading={generateText.isPending}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="card__title">Background Music</h2>
          <MusicSelector
            onSelect={(id) =>
              selectMusic.mutate({ musicReference: id })
            }
          />
          <MusicPreview
            previewUrl={musicPreviewData.previewUrl}
            musicName={musicPreviewData.musicName}
          />
        </div>
      </div>

      {/* Right column */}
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
            onRemove={() => {
              if (localImageUrl) {
                URL.revokeObjectURL(localImageUrl);
                setLocalImageUrl(null);
                setLocalImageName('');
              } else {
                removeImage.mutate();
              }
            }}
            disabled={removeImage.isPending}
          />
          <div className="generate-btn-group" style={{ display: 'flex', gap: 8 }}>
            <ImageSelectorButton onImageSelected={handleImageSelected} />
            <GenerateImageButton isLoading={generateImage.isPending} />
          </div>
        </div>
      </div>
    </div>

    {updateText.isPending && (
      <div className="meditation-builder__save-indicator">
        Saving...
      </div>
    )}
  </div>
);
}

export default MeditationBuilderPage;
