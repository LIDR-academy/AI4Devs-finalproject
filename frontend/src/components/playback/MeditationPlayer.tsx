/**
 * MeditationPlayer Component
 * 
 * Multimedia player for meditation content.
 * 
 * Features:
 * - Audio playback (MP3)
 * - Video playback (MP4)
 * - Subtitles support (SRT)
 * - Standard HTML5 media controls
 * - Auto-detects media type (audio vs video)
 * 
 * Business Rules:
 * - Only COMPLETED meditations can be played
 * - Shows error message if playback fails
 * - Gracefully handles missing media URLs
 */

import React, { useRef, useEffect, useState } from 'react';

export interface MediaUrls {
  audioUrl?: string | null;
  videoUrl?: string | null;
  subtitlesUrl?: string | null;
}

export interface MeditationPlayerProps {
  meditationId: string | null;
  title?: string;
  mediaUrls?: MediaUrls | null;
  onPlaybackError?: (error: Error) => void;
  className?: string;
}

/**
 * Determines the primary media type to play.
 * Priority: video > audio
 */
const getMediaType = (mediaUrls?: MediaUrls | null): 'video' | 'audio' | null => {
  if (!mediaUrls) return null;
  if (mediaUrls.videoUrl) return 'video';
  if (mediaUrls.audioUrl) return 'audio';
  return null;
};

/**
 * MeditationPlayer Component
 * 
 * Renders an HTML5 media player (audio or video) based on available URLs.
 * 
 * @example
 * ```tsx
 * <MeditationPlayer
 *   meditationId="550e8400-e29b-41d4-a716-446655440000"
 *   title="Morning Mindfulness"
 *   mediaUrls={{
 *     audioUrl: "https://s3.amazonaws.com/audio.mp3",
 *     videoUrl: null,
 *     subtitlesUrl: null
 *   }}
 * />
 * ```
 */
export const MeditationPlayer: React.FC<MeditationPlayerProps> = ({
  meditationId,
  title = 'Meditación',
  mediaUrls,
  onPlaybackError,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaType = getMediaType(mediaUrls);

  // Reset error when meditation changes
  useEffect(() => {
    setError(null);
  }, [meditationId]);

  // Handle media errors
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleMediaError = (_e: React.SyntheticEvent<HTMLMediaElement, Event>) => {
    const errorMessage = 'Error al cargar el contenido multimedia';
    setError(errorMessage);
    
    if (onPlaybackError) {
      onPlaybackError(new Error(errorMessage));
    }
  };

  // No meditation selected
  if (!meditationId || !mediaUrls) {
    return (
      <div 
        className={`meditation-player meditation-player--empty ${className}`}
        data-testid="meditation-player-empty"
      >
        <div className="meditation-player__placeholder">
          <p>Selecciona una meditación completada para reproducir</p>
        </div>
      </div>
    );
  }

  // No playable media
  if (!mediaType) {
    return (
      <div 
        className={`meditation-player meditation-player--no-media ${className}`}
        data-testid="meditation-player-no-media"
      >
        <div className="meditation-player__error">
          <p>No hay contenido multimedia disponible para esta meditación</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`meditation-player meditation-player--error ${className}`}
        role="alert"
      >
        <div className="meditation-player__error">
          <p className="meditation-player__error-message">{error}</p>
          <p className="meditation-player__error-hint">
            Verifica tu conexión a Internet e intenta de nuevo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`meditation-player meditation-player--${mediaType} ${className}`}
      data-testid={`meditation-player-${mediaType}`}
    >
      {/* Player header */}
      <div className="meditation-player__header">
        <h2 className="meditation-player__title">{title}</h2>
      </div>

      {/* Media player */}
      <div className="meditation-player__media">
        {mediaType === 'video' && mediaUrls.videoUrl && (
          <video
            key={`video-${meditationId}`} // Force fresh element when meditation ID changes
            ref={videoRef}
            src={mediaUrls.videoUrl} // Use src directly for more reliable React updates
            className="meditation-player__video"
            controls
            autoPlay // Restored autoPlay for one-click play from list
            preload="auto"
            crossOrigin="anonymous"
            onError={handleMediaError}
            aria-label={`Reproduciendo video: ${title}`}
          >
            {mediaUrls.subtitlesUrl && (
              <track
                kind="subtitles"
                src={mediaUrls.subtitlesUrl}
                srcLang="es"
                label="Español"
                default
              />
            )}
            Tu navegador no soporta reproducción de video.
          </video>
        )}

        {mediaType === 'audio' && mediaUrls.audioUrl && (
          <audio
            key={`audio-${meditationId}`} // Force fresh element when meditation ID changes
            ref={audioRef}
            src={mediaUrls.audioUrl} // Use src directly for more reliable React updates
            className="meditation-player__audio"
            controls
            autoPlay // Restored autoPlay for one-click play from list
            preload="auto"
            crossOrigin="anonymous"
            onError={handleMediaError}
            aria-label={`Reproduciendo audio: ${title}`}
          >
            Tu navegador no soporta reproducción de audio.
          </audio>
        )}
      </div>

      {/* Player info */}
      <div className="meditation-player__info">
        <p className="meditation-player__media-type">
          {mediaType === 'video' ? '📹 Video' : '🎵 Audio'}
        </p>
        {mediaType === 'video' && mediaUrls.subtitlesUrl && (
          <p className="meditation-player__subtitles-available">
            📝 Subtítulos disponibles
          </p>
        )}
      </div>
    </div>
  );
};

export default MeditationPlayer;
