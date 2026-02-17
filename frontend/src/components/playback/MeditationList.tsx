/**
 * MeditationList Component
 * 
 * Displays a list of meditation cards.
 * 
 * Features:
 * - Shows all meditations ordered by creation date (most recent first)
 * - Empty state message when no meditations exist
 * - Responsive grid layout
 */

import React from 'react';
import MeditationCard, { MeditationCardProps } from './MeditationCard';

export interface MeditationListProps {
  meditations: Array<Omit<MeditationCardProps, 'onPlay'>>;
  onPlay: (meditationId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * MeditationList Component
 * 
 * Renders a grid of meditation cards.
 * Shows empty state if no meditations available.
 * 
 * @example
 * ```tsx
 * <MeditationList
 *   meditations={[
 *     { id: "1", title: "Morning", state: "COMPLETED", ... },
 *     { id: "2", title: "Evening", state: "PROCESSING", ... }
 *   ]}
 *   onPlay={(id) => console.log('Play meditation:', id)}
 * />
 * ```
 */
export const MeditationList: React.FC<MeditationListProps> = ({
  meditations,
  onPlay,
  isLoading = false,
  error = null,
  className = ''
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`meditation-list meditation-list--loading ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="meditation-list__loader">
          <p>Cargando meditaciones...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`meditation-list meditation-list--error ${className}`}
        role="alert"
      >
        <div className="meditation-list__error">
          <p className="meditation-list__error-message">{error}</p>
          <p className="meditation-list__error-hint">
            Intenta recargar la página o contacta con soporte si el problema persiste.
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!meditations || meditations.length === 0) {
    return (
      <div 
        className={`meditation-list meditation-list--empty ${className}`}
        data-testid="meditation-list-empty"
      >
        <div className="meditation-list__empty-state">
          <p className="meditation-list__empty-message">
            Aún no tienes meditaciones. Empieza creando una nueva.
          </p>
          {/* TODO: Add "Create Meditation" button when US2/US3 integration ready */}
        </div>
      </div>
    );
  }

  // Meditations list
  return (
    <div 
      className={`meditation-list ${className}`}
      data-testid="meditation-list"
      role="list"
      aria-label="Lista de meditaciones"
    >
      <div className="meditation-list__grid">
        {meditations.map((meditation) => (
          <div 
            key={meditation.id}
            role="listitem"
          >
            <MeditationCard
              {...meditation}
              onPlay={onPlay}
            />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div 
        className="meditation-list__summary"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="meditation-list__count">
          {meditations.length} {meditations.length === 1 ? 'meditación' : 'meditaciones'}
        </p>
      </div>
    </div>
  );
};

export default MeditationList;
