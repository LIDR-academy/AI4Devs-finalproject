import { useState } from 'react';
import type { GenreResolution, GenreResolutionMap } from '../../api/types';
import { GenreResolutionPanel } from '../GenreResolutionPanel';
import { Button } from '../ui';
import './ImportGenreResolutionStep.css';

export type UnresolvedImportGenre = {
  raw_genre: string;
  book_count: number;
};

export type ImportGenreResolutionStepProps = {
  unresolvedGenres: UnresolvedImportGenre[];
  onConfirm: (resolutions: GenreResolutionMap) => void;
  onBack: () => void;
  disabled?: boolean;
};

export function ImportGenreResolutionStep({
  unresolvedGenres,
  onConfirm,
  onBack,
  disabled = false,
}: ImportGenreResolutionStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolutions, setResolutions] = useState<GenreResolutionMap>({});

  const current = unresolvedGenres[currentIndex];
  const isLast = currentIndex >= unresolvedGenres.length - 1;

  if (!current) {
    return null;
  }

  function handleResolved(choice: GenreResolution) {
    const nextResolutions = {
      ...resolutions,
      [current.raw_genre]: choice,
    };
    setResolutions(nextResolutions);

    if (isLast) {
      onConfirm(nextResolutions);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  return (
    <div className="import-genre-resolution">
      <p className="import-genre-resolution__progress">
        Género {currentIndex + 1} de {unresolvedGenres.length} · afecta a{' '}
        {current.book_count} {current.book_count === 1 ? 'libro' : 'libros'}
      </p>
      <GenreResolutionPanel
        rawGenre={current.raw_genre}
        disabled={disabled}
        onResolved={(choice) => handleResolved(choice)}
        onCancel={onBack}
      />
      {!isLast ? (
        <Button type="button" variant="ghost" disabled={disabled} onClick={onBack}>
          Cancelar importación
        </Button>
      ) : null}
    </div>
  );
}
