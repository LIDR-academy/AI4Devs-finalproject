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
import MeditationRow, { MeditationRowProps } from './MeditationRow';

export interface MeditationListProps {
  meditations: Array<Omit<MeditationRowProps, 'onPlay'>>;
  onPlay: (meditationId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * MeditationList Component
 * 
 * Renders a table of meditation rows.
 * Shows empty state if no meditations available.
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
        </div>
      </div>
    );
  }

  // Meditations list table
  return (
    <div 
      className={`meditation-list ${className}`}
      data-testid="meditation-list"
    >
      <table className="meditation-list__table">
        <thead>
          <tr>
            <th className="meditation-list__th">Estado</th>
            <th className="meditation-list__th">Título</th>
            <th className="meditation-list__th">Tipo</th>
            <th className="meditation-list__th">Creada el</th>
            <th className="meditation-list__th">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {meditations.map((meditation) => (
            <MeditationRow
              key={meditation.id}
              {...meditation}
              onPlay={onPlay}
            />
          ))}
        </tbody>
      </table>

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
