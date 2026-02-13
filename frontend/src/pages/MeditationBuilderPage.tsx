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
  GenerationResultModal,
} from '@/components';
import ImageSelectorButton from '@/components/ImageSelectorButton';
import MusicSelectorButton from '@/components/MusicSelectorButton';
import LocalMusicItem from '@/components/LocalMusicItem';
import { useUploadImage, useUploadMusic } from '@/hooks/useFileUpload';
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

  // File upload hooks (solo se usan al hacer Generate, no al seleccionar)
  const uploadImage = useUploadImage();
  const uploadMusic = useUploadMusic();

  const musicPreview = useMusicPreview(compositionId, !!selectedMusicId);
  const imagePreview = useImagePreview(compositionId, !!selectedImageId);




  useEffect(() => {
    if (!compositionId) return;
    const t = setTimeout(() => {
      updateText.mutate({ text: localText });
    }, AUTO_SAVE_DELAY);
    return () => clearTimeout(t);
  }, [localText, compositionId]);

  // Estado local para preview de audio seleccionado (blob URL para preview)
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [localAudioName, setLocalAudioName] = useState<string>('');
  // Estado para guardar el File object (se subirá al hacer Generate)
  const [localAudioFile, setLocalAudioFile] = useState<File | null>(null);

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

  // Estado local para preview de imagen seleccionada (blob URL para preview)
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [localImageName, setLocalImageName] = useState<string>('');
  // Estado para guardar el File object (se subirá al hacer Generate)
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);

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

  // Cuando el usuario selecciona un archivo de audio (solo preview)
  const handleAudioSelected = useCallback((file: File) => {
    if (localAudioUrl) {
      URL.revokeObjectURL(localAudioUrl);
    }
    const url = URL.createObjectURL(file);
    setLocalAudioUrl(url);
    setLocalAudioName(file.name);
    setLocalAudioFile(file); // Guardar el File para subirlo después
  }, [localAudioUrl]);

  // Cuando el usuario selecciona un archivo de imagen (solo preview)
  const handleImageSelected = useCallback((file: File) => {
    if (localImageUrl) {
      URL.revokeObjectURL(localImageUrl);
    }
    const url = URL.createObjectURL(file);
    setLocalImageUrl(url);
    setLocalImageName(file.name);
    setLocalImageFile(file); // Guardar el File para subirlo después
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
                setLocalAudioFile(null); // Limpiar el File object
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
                    setLocalAudioFile(null);
                  }
                }}
              />
            </>
          )}
          
          <div style={{ marginTop: '8px' }}>
            <MusicSelectorButton 
              onAudioSelected={handleAudioSelected}
              disabled={generateText.isPending || generateImage.isPending} 
            />
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="meditation-builder__right">
        <div className="card">
          <h2 className="card__title">Output Type</h2>
          <OutputTypeIndicator
            onClick={async () => {
              try {
                // 1. Subir archivos locales a S3 si existen
                let musicRef = selectedMusicId || 'default-music';
                let imageRef = selectedImageId || undefined;

                // Subir música si hay un archivo local
                if (localAudioFile) {
                  const uploadResult = await uploadMusic.mutateAsync(localAudioFile);
                  musicRef = uploadResult.fileUrl;
                  console.log('Music uploaded to S3:', musicRef);
                }

                // Subir imagen si hay un archivo local
                if (localImageFile) {
                  const uploadResult = await uploadImage.mutateAsync(localImageFile);
                  imageRef = uploadResult.fileUrl;
                  console.log('Image uploaded to S3:', imageRef);
                }

                // 2. Iniciar generación con las URLs de S3
                generation.start({
                  request: {
                    text: localText,
                    musicReference: musicRef,
                    imageReference: imageRef,
                  },
                  compositionId: compositionId || undefined,
                });
              } catch (error) {
                console.error('Failed to upload files:', error);
                alert('Failed to upload files. Please try again.');
              }
            }}
            disabled={
              !localText.trim() || 
              !(selectedMusicId || localAudioUrl) ||
              generateText.isPending || 
              generateImage.isPending ||
              generation.isCreating ||
              uploadImage.isPending ||
              uploadMusic.isPending
            }
            isLoading={generation.isCreating}
          />
          
          {generation.isCreating && (
            <div style={{ marginTop: '16px' }}>
              <GenerationStatusBar
                progress={generation.progress}
                message="Creating your meditation content..."
              />
            </div>
          )}
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
                setLocalImageFile(null);
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
            <ImageSelectorButton 
              onImageSelected={handleImageSelected}
              disabled={generateText.isPending || generateImage.isPending} 
            />
            <GenerateImageButton
              isLoading={generateImage.isPending}
              disabled={generateText.isPending || generateImage.isPending || !!(selectedImageId && selectedImageId.startsWith('data:image/'))}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Generation Result Modal */}
    <GenerationResultModal
      isOpen={generation.isCompleted || generation.isFailed}
      result={generation.result}
      error={generation.errorMessage}
      onClose={() => generation.reset()}
      onRetry={async () => {
        try {
          // Subir archivos locales a S3 si existen
          let musicRef = selectedMusicId || 'default-music';
          let imageRef = selectedImageId || undefined;

          if (localAudioFile) {
            const uploadResult = await uploadMusic.mutateAsync(localAudioFile);
            musicRef = uploadResult.fileUrl;
          }

          if (localImageFile) {
            const uploadResult = await uploadImage.mutateAsync(localImageFile);
            imageRef = uploadResult.fileUrl;
          }

          generation.start({
            request: {
              text: localText,
              musicReference: musicRef,
              imageReference: imageRef,
            },
            compositionId: compositionId || undefined,
          });
        } catch (error) {
          console.error('Failed to upload files on retry:', error);
          alert('Failed to upload files. Please try again.');
        }
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
