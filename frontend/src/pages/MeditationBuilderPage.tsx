import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  TextEditor,
  OutputTypeIndicator,
  ImagePreview,
  GenerateTextButton,
  GenerateImageButton,
  GenerationStatusBar,
} from '@/components';
import ImageSelectorButton from '@/components/ImageSelectorButton';
import MusicSelectorButton from '@/components/MusicSelectorButton';
import LocalMusicItem from '@/components/LocalMusicItem';
import { useUploadImage, useUploadMusic } from '@/hooks/useFileUpload';
import {
  useUpdateText,
  useRemoveImage,
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
  const removeImage = useRemoveImage(compositionId);

  const generateText = useGenerateText({ compositionId });
  const generateImage = useGenerateImage({ prompt: localText });
  
  // Generation hook (US3 - Generate Meditation Audio/Video)
  const generation = useGenerateMeditation();

  // File upload hooks (solo se usan al hacer Generate, no al seleccionar)
  const uploadImage = useUploadImage();
  const uploadMusic = useUploadMusic();

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
    return {
      previewUrl: localAudioUrl ?? undefined,
      musicName: localAudioName,
    };
  }, [localAudioUrl, localAudioName]);

  // Track music duration
  const [musicDuration, setMusicDuration] = useState<number | null>(null);

  useEffect(() => {
    if (musicPreviewData.previewUrl) {
      const audio = new Audio(musicPreviewData.previewUrl);
      const handleLoadedMetadata = () => {
        setMusicDuration(Math.ceil(audio.duration));
      };
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      // Forzar carga de metadata si ya está listo (caché)
      if (audio.readyState >= 1) {
        handleLoadedMetadata();
      }
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    } else {
      setMusicDuration(null);
    }
  }, [musicPreviewData.previewUrl]);

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

  // Calcula la duración estimada
  const estimatedDuration = useMemo(() => {
    // Si hay música seleccionada, devolvemos su duración real
    if (musicDuration) return musicDuration;

    // Si no, estimamos por texto
    if (!localText.trim()) return 0;
    const wordCount = localText.trim().split(/\s+/).length;
    return Math.ceil(wordCount / 2.5); // 150 words per minute = 2.5 words per second
  }, [localText, musicDuration]);

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
        
        {/* Status indicator in header */}
        <div style={{ marginTop: '1rem' }}>
          {generation.isCompleted ? (
            <div className="generation-result--success-header" style={{
              fontSize: '1.2rem',
              color: '#4caf50',
              backgroundColor: '#1a1a1a',
              padding: '1rem',
              borderRadius: '8px',
              display: 'inline-block',
              border: '1px solid #4caf50'
            }}>
              <div style={{ marginBottom: '8px' }}>
                ✅ <strong>Generation Complete!</strong> Duration: <strong>{formatDuration(generation.result?.durationSeconds || 0)}</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {generation.result?.mediaUrl && (
                  <a href={generation.result.mediaUrl} download className="btn btn--primary btn--small" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                    📥 Download {generation.result.type === 'VIDEO' ? 'Video' : 'Audio'}
                  </a>
                )}
                {generation.result?.subtitleUrl && (
                  <a href={generation.result.subtitleUrl} download className="btn btn--secondary btn--small" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                    📄 Subtitles
                  </a>
                )}
                <button onClick={() => generation.reset()} className="btn btn--text" style={{ fontSize: '0.9rem', marginLeft: '8px', color: '#888' }}>
                  Clear
                </button>
              </div>
            </div>
          ) : generation.isFailed ? (
            <div style={{
              fontSize: '1.2rem',
              color: '#f44336',
              backgroundColor: '#1a1a1a',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'inline-block',
              border: '1px solid #f44336'
            }}>
              ❌ <strong>Generation Failed</strong>
              <button onClick={() => generation.reset()} className="btn btn--text" style={{ fontSize: '0.9rem', marginLeft: '12px', color: '#ffc107' }}>
                Try Again
              </button>
            </div>
          ) : estimatedDuration > 0 ? (
            <div className="meditation-builder__estimated-duration" style={{ 
              fontSize: '1.2rem', 
              color: '#646cff',
              backgroundColor: '#1a1a1a',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'inline-block'
            }}>
              <span>Estimated Duration: <strong>{formatDuration(estimatedDuration)}</strong></span>
            </div>
          ) : null}
        </div>
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
          ) : null}
          
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

    {/* Generation Result Modal removed - moved to header per user request */}

    {updateText.isPending && (
      <div className="meditation-builder__save-indicator">
        Saving...
      </div>
    )}
  </div>
);
}

/**
 * Format duration in seconds to human-readable format
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

