import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  TextEditor,
  OutputTypeIndicator,
  MusicSelector,
  MusicPreview,
  ImagePreview,
  GenerateTextButton,
  GenerateImageButton,
  GenerationStatusBar,
  GenerateMeditationButton,
  GenerationResultModal,
} from '@/components';
import ImageSelectorButton from '@/components/ImageSelectorButton';
import MusicSelectorButton from '@/components/MusicSelectorButton';
import LocalMusicItem from '@/components/LocalMusicItem';
import {
  useUpdateText,
  useSelectMusic,
  useRemoveImage,
  useMusicPreview,
  useImagePreview,
  useGenerateMeditation,
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

// ...eliminado, ya está importado arriba

export function MeditationBuilderPage() {
  const compositionId = useCompositionId();
  const localText = useLocalText();
  const selectedMusicId = useSelectedMusicId();
  const selectedImageId = useSelectedImageId();
  const generationError = useGenerationError();

  const updateText = useUpdateText(compositionId);
  const selectMusic = useSelectMusic(compositionId);
  const removeImage = useRemoveImage(compositionId);

  const generateText = useGenerateText({ compositionId });
  const generateImage = useGenerateImage({ prompt: localText });
  
  // Generation hook (US3 - Generate Meditation Audio/Video)
  const generation = useGenerateMeditation();

  const musicPreview = useMusicPreview(compositionId, !!selectedMusicId);
  const imagePreview = useImagePreview(compositionId, !!selectedImageId);




  useEffect(() => {
    if (!compositionId) return;
    const t = setTimeout(() => {
      updateText.mutate({ text: localText });
    }, AUTO_SAVE_DELAY);
    return () => clearTimeout(t);
  }, [localText, compositionId]);

  // Estado local para preview de audio seleccionado
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [localAudioName, setLocalAudioName] = useState<string>('');

  const musicPreviewData = useMemo(() => {
    if (localAudioUrl) {
      return {
        previewUrl: localAudioUrl,
        musicName: localAudioName,
      };
    }
    return {
      previewUrl: musicPreview.data?.previewUrl,
      musicName: musicPreview.data?.musicReference ?? selectedMusicId ?? '',
    };
  }, [localAudioUrl, localAudioName, musicPreview.data, selectedMusicId]);

  // Estado local para preview de imagen seleccionada
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [localImageName, setLocalImageName] = useState<string>('');

  // Unifica preview: local (blob) o IA (base64 en selectedImageId)
  const imagePreviewData = useMemo(() => {
    if (localImageUrl) {
      return {
        previewUrl: localImageUrl,
        imageName: localImageName,
      };
    }
    // Si selectedImageId es un data:image (IA generada), úsalo como preview
    if (selectedImageId && selectedImageId.startsWith('data:image/')) {
      return {
        previewUrl: selectedImageId,
        imageName: 'AI generated image',
      };
    }
    // Si hay imagen de servidor (catálogo), usa la previewUrl
    return {
      previewUrl: imagePreview.data?.previewUrl,
      imageName: imagePreview.data?.imageReference ?? selectedImageId ?? '',
    };
  }, [localImageUrl, localImageName, imagePreview.data, selectedImageId]);

  // Limpieza de URL local de audio
  const handleAudioSelected = useCallback((file: File) => {
    if (localAudioUrl) {
      URL.revokeObjectURL(localAudioUrl);
    }
    const url = URL.createObjectURL(file);
    setLocalAudioUrl(url);
    setLocalAudioName(file.name);
  }, [localAudioUrl]);

  // Limpieza de URL local de imagen
  const handleImageSelected = useCallback((file: File) => {
    if (localImageUrl) {
      URL.revokeObjectURL(localImageUrl);
    }
    const url = URL.createObjectURL(file);
    setLocalImageUrl(url);
    setLocalImageName(file.name);
  }, [localImageUrl]);

  // Limpieza al desmontar - audio
  React.useEffect(() => {
    return () => {
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
      }
    };
  }, [localAudioUrl]);

  // Limpieza al desmontar - imagen
  React.useEffect(() => {
    return () => {
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
      }
    };
  }, [localImageUrl]);




  // Sincroniza el outputType global con la presencia de imagen local o IA generada
  useEffect(() => {
    if (localImageUrl) {
      useComposerStore.getState().updateOutputType('VIDEO');
    } else if (selectedImageId && selectedImageId.startsWith('data:image/')) {
      useComposerStore.getState().updateOutputType('VIDEO');
    } else if (!imagePreview.data?.previewUrl && !selectedImageId) {
      useComposerStore.getState().updateOutputType('PODCAST');
    }
  }, [localImageUrl, imagePreview.data?.previewUrl, selectedImageId]);

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
            disabled={generateText.isPending || generateImage.isPending}
            placeholder="Enter your meditation text here, or use AI to generate it..."
          />
          <div className="generate-btn-group">
            <GenerateTextButton
              onGenerate={() => generateText.mutate({ existingText: localText })}
              isLoading={generateText.isPending}
              disabled={generateText.isPending || generateImage.isPending || !localText.trim()}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="card__title">Background Music</h2>
          
          {localAudioUrl ? (
            <LocalMusicItem 
              previewUrl={localAudioUrl}
              musicName={localAudioName}
              onRemove={() => {
                URL.revokeObjectURL(localAudioUrl);
                setLocalAudioUrl(null);
                setLocalAudioName('');
                useComposerStore.getState().setIsMusicPlaying(false);
              }}
            />
          ) : (
            <>
              <MusicSelector
                onSelect={(id) =>
                  selectMusic.mutate({ musicReference: id })
                }
              />
              <MusicPreview
                previewUrl={musicPreviewData.previewUrl}
                musicName={musicPreviewData.musicName}
                onRemove={() => {
                  if (localAudioUrl) {
                    URL.revokeObjectURL(localAudioUrl);
                    setLocalAudioUrl(null);
                    setLocalAudioName('');
                  }
                }}
              />
            </>
          )}
          
          <div style={{ marginTop: '8px' }}>
            <MusicSelectorButton onAudioSelected={handleAudioSelected} disabled={generateText.isPending || generateImage.isPending} />
          </div>
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
              } else if (selectedImageId && selectedImageId.startsWith('data:image/')) {
                // Elimina imagen IA generada
                useComposerStore.getState().setSelectedImage(null);
              } else {
                removeImage.mutate();
              }
            }}
            disabled={removeImage.isPending}
          />
          <div className="generate-btn-group" style={{ display: 'flex', gap: 8 }}>
            <ImageSelectorButton onImageSelected={handleImageSelected} disabled={generateText.isPending || generateImage.isPending} />
            <GenerateImageButton
              isLoading={generateImage.isPending}
              disabled={generateText.isPending || generateImage.isPending || !!(selectedImageId && selectedImageId.startsWith('data:image/'))}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Generation Section (US3) */}
    <div className="meditation-builder__generation">
      {generation.isCreating && (
        <GenerationStatusBar
          progress={generation.progress}
          message="Creating your meditation content..."
        />
      )}
      
      {!generation.isCreating && (
        <GenerateMeditationButton
          onClick={() => {
            // Determine output type based on image presence
            const outputType = selectedImageId || localImageUrl ? 'VIDEO' : 'PODCAST';
            
            generation.start({
              text: localText,
              musicReference: selectedMusicId || 'default-music', // TODO: Handle missing music
              imageReference: selectedImageId || localImageUrl || undefined,
            });
          }}
          disabled={
            !localText.trim() || 
            !(selectedMusicId || localAudioUrl) ||
            generateText.isPending || 
            generateImage.isPending ||
            generation.isCreating
          }
          isLoading={generation.isCreating}
          outputType={selectedImageId || localImageUrl ? 'VIDEO' : 'PODCAST'}
        />
      )}
    </div>

    {/* Generation Result Modal */}
    <GenerationResultModal
      isOpen={generation.isCompleted || generation.isFailed}
      result={generation.result}
      error={generation.errorMessage}
      onClose={() => generation.reset()}
      onRetry={() => {
        generation.start({
          text: localText,
          musicReference: selectedMusicId || 'default-music',
          imageReference: selectedImageId || localImageUrl || undefined,
        });
      }}
    />

    {updateText.isPending && (
      <div className="meditation-builder__save-indicator">
        Saving...
      </div>
    )}
  </div>
);
}

export default MeditationBuilderPage;
