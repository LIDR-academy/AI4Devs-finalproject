/**
 * MeditationCard Component
 * 
 * Displays a single meditation with:
 * - Title
 * - Processing state label (colored badge)
 * - Creation date
 * - Play button (disabled if state !== COMPLETED)
 * 
 * Business Rules:
 * - Play button only enabled for COMPLETED meditations
 * - Shows helpful message when meditation not playable
 */

import React from 'react';
import StateLabel, { ProcessingState } from './StateLabel';

export interface MeditationCardProps {
  id: string;
  title: string;
  state: ProcessingState;
  stateLabel: string;
  createdAt: string | Date; // ISO 8601 string or Date object
  mediaUrls?: {
    audioUrl?: string | null;
    videoUrl?: string | null;
    subtitlesUrl?: string | null;  
  } | null;
  onPlay: (meditationId: string) => void;
  className?: string;
}

/**
 * Formats ISO 8601 timestamp or Date to user-friendly date string.
 * @example "2026-02-16T10:30:00Z" → "16 Feb 2026"
 */
const formatDate = (input: string | Date): string => {
  try {
    const date = typeof input === 'string' ? new Date(input) : input;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return String(input); // Fallback to string representation if parsing fails
  }
};

/**
 * MeditationCard Component
 * 
 * Renders a card for a single meditation in the library.
 * 
 * @example
 * ```tsx
 * <MeditationCard
 *   id="550e8400-e29b-41d4-a716-446655440000"
 *   title="Morning Mindfulness"
 *   state="COMPLETED"
 *   stateLabel="Completada"
 *   createdAt="2026-02-16T10:30:00Z"
 *   mediaUrls={{ audioUrl: "https://..." }}
 *   onPlay={(id) => console.log('Play:', id)}
 * />
 * ```
 */
export const MeditationCard: React.FC<MeditationCardProps> = ({
  id,
  title,
  state,
  stateLabel,
  createdAt,
  mediaUrls,
  onPlay,
  className = ''
}) => {
  const isPlayable = state === 'COMPLETED';
  const formattedDate = formatDate(createdAt);
  const dateTimeValue = typeof createdAt === 'string' ? createdAt : createdAt.toISOString();

  const handlePlayClick = () => {
    if (isPlayable) {
      onPlay(id);
    }
  };

  // Determine if there's media content available
  // Note: Reserved for future features (e.g., show preview indicator)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _hasMedia = mediaUrls && (
    mediaUrls.audioUrl || 
    mediaUrls.videoUrl
  );

  return (
    <div 
      className={`meditation-card ${className}`}
      data-testid={`meditation-card-${id}`}
    >
      <div className="meditation-card__content">
        {/* Title */}
        <h3 className="meditation-card__title">
          {title}
        </h3>

        {/* State and Date */}
        <div className="meditation-card__metadata">
          <StateLabel state={state} label={stateLabel} />
          <time 
            className="meditation-card__date"
            dateTime={dateTimeValue}
          >
            {formattedDate}
          </time>
        </div>

        {/* Play Button */}
        <button
          className="meditation-card__play-button"
          onClick={handlePlayClick}
          disabled={!isPlayable}
          aria-label={
            isPlayable 
              ? `Reproducir ${title}` 
              : `Meditación en estado: ${stateLabel}`
          }
          title={
            isPlayable
              ? 'Reproducir meditación'
              : 'Esta meditación aún se está procesando'
          }
        >
          {isPlayable ? '▶ Reproducir' : `⏸ ${stateLabel}`}
        </button>

        {/* Helper message for non-playable states */}
        {!isPlayable && state === 'PROCESSING' && (
          <p className="meditation-card__message meditation-card__message--info">
            Aún se está procesando. Espera a que esté lista.
          </p>
        )}
        {!isPlayable && state === 'PENDING' && (
          <p className="meditation-card__message meditation-card__message--info">
            En cola para ser generada.
          </p>
        )}
        {!isPlayable && state === 'FAILED' && (
          <p className="meditation-card__message meditation-card__message--error">
            Error al generar. Inténtalo de nuevo.
          </p>
        )}
      </div>
    </div>
  );
};

export default MeditationCard;
