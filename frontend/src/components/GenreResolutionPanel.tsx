import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createGenre, matchGenre } from '../api/client';
import { GenreSelect } from './GenreSelect';
import { Button } from './ui';
import './GenreResolutionPanel.css';

export type GenreResolutionChoice =
  | { action: 'assign'; genre_id: string }
  | { action: 'create' }
  | { action: 'skip' };

export type GenreResolutionPanelProps = {
  rawGenre: string;
  onResolved: (choice: GenreResolutionChoice, genreId: string | null) => void;
  onCancel?: () => void;
  disabled?: boolean;
};

export function GenreResolutionPanel({
  rawGenre,
  onResolved,
  onCancel,
  disabled = false,
}: GenreResolutionPanelProps) {
  const queryClient = useQueryClient();
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => createGenre(rawGenre),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['genres'] });
      onResolved({ action: 'create' }, created.id);
    },
    onError: () => {
      setError('No se pudo crear el género.');
    },
  });

  return (
    <div className="genre-resolution" role="region" aria-label="Resolver género">
      <p className="genre-resolution__message">
        Hemos encontrado el género &quot;{rawGenre}&quot; pero no está en tu lista.
        ¿Qué quieres hacer?
      </p>
      <GenreSelect
        id="genre-resolution-select"
        label="Asignar a un género existente"
        value={selectedGenreId}
        disabled={disabled || createMutation.isPending}
        onChange={setSelectedGenreId}
      />
      <div className="genre-resolution__actions">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || !selectedGenreId || createMutation.isPending}
          onClick={() => {
            if (!selectedGenreId) return;
            onResolved({ action: 'assign', genre_id: selectedGenreId }, selectedGenreId);
          }}
        >
          Asignar
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          Crear &quot;{rawGenre}&quot;
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || createMutation.isPending}
          onClick={() => onResolved({ action: 'skip' }, null)}
        >
          Dejar en blanco
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" disabled={disabled} onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="genre-resolution__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

async function resolveGenreIdFromCatalog(
  catalogGenre: string | null,
): Promise<{ genreId: string | null; needsResolution: boolean; rawGenre: string | null }> {
  if (!catalogGenre?.trim()) {
    return { genreId: null, needsResolution: false, rawGenre: null };
  }

  const match = await matchGenre(catalogGenre);
  if (match.status === 'matched' && match.genre_id) {
    return { genreId: match.genre_id, needsResolution: false, rawGenre: catalogGenre };
  }

  if (match.status === 'unresolved') {
    return { genreId: null, needsResolution: true, rawGenre: catalogGenre };
  }

  return { genreId: null, needsResolution: false, rawGenre: catalogGenre };
}

export { resolveGenreIdFromCatalog };
