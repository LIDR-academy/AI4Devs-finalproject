import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import {
  createGenre,
  deleteGenre,
  getGenreAffectedBookCount,
  listGenres,
} from '../../api/client';
import { messageFromUnknownError } from '../../api/errors';
import { Button, Card, ConfirmModal, Input } from '../ui';
import './GenreSettingsSection.css';

type PendingDelete = {
  id: string;
  name: string;
  affectedBookCount: number;
};

export function GenreSettingsSection() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deletePreviewLoadingId, setDeletePreviewLoadingId] = useState<string | null>(
    null,
  );

  const { data: genres = [], isLoading, error } = useQuery({
    queryKey: ['genres'],
    queryFn: listGenres,
  });

  const createMutation = useMutation({
    mutationFn: (genreName: string) => createGenre(genreName),
    onSuccess: () => {
      setName('');
      setFormError(null);
      void queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
    onError: (err) => {
      setFormError(messageFromUnknownError(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (genreId: string) => deleteGenre(genreId),
    onSuccess: () => {
      setPendingDelete(null);
      setDeleteError(null);
      void queryClient.invalidateQueries({ queryKey: ['genres'] });
      void queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (err) => {
      setDeleteError(messageFromUnknownError(err));
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError('Introduce un nombre para el género.');
      return;
    }
    setFormError(null);
    createMutation.mutate(trimmed);
  }

  async function handleDeleteClick(genreId: string, genreName: string) {
    setDeleteError(null);
    setDeletePreviewLoadingId(genreId);

    try {
      const { affected_book_count } = await getGenreAffectedBookCount(genreId);

      if (affected_book_count === 0) {
        deleteMutation.mutate(genreId);
        return;
      }

      setPendingDelete({
        id: genreId,
        name: genreName,
        affectedBookCount: affected_book_count,
      });
    } catch (err) {
      setDeleteError(messageFromUnknownError(err));
    } finally {
      setDeletePreviewLoadingId(null);
    }
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id);
  }

  return (
    <Card title="Géneros" className="genre-settings">
      <p className="genre-settings__intro">
        Personaliza las etiquetas de género para clasificar tus libros (fantasía,
        thriller, romance, etc.).
      </p>

      {isLoading ? (
        <p className="genre-settings__status">Cargando géneros…</p>
      ) : null}
      {error ? (
        <p className="genre-settings__error" role="alert">
          No se pudieron cargar los géneros.
        </p>
      ) : null}
      {deleteError ? (
        <p className="genre-settings__error" role="alert">
          {deleteError}
        </p>
      ) : null}

      <ul className="genre-settings__list" aria-label="Géneros configurados">
        {genres.map((genre) => (
          <li key={genre.id} className="genre-settings__item">
            <span className="genre-settings__name">
              {genre.name}
              {genre.is_default ? (
                <span className="genre-settings__badge">Predeterminado</span>
              ) : null}
            </span>
            <Button
              type="button"
              variant="ghost"
              className="genre-settings__delete"
              disabled={
                deleteMutation.isPending || deletePreviewLoadingId === genre.id
              }
              onClick={() => void handleDeleteClick(genre.id, genre.name)}
            >
              {deletePreviewLoadingId === genre.id ? 'Comprobando…' : 'Eliminar'}
            </Button>
          </li>
        ))}
      </ul>

      <form className="genre-settings__form" onSubmit={handleSubmit}>
        <Input
          label="Nuevo género"
          value={name}
          maxLength={100}
          placeholder="Ej. Misterio"
          onChange={(event) => setName(event.target.value)}
        />
        {formError ? (
          <p className="genre-settings__error" role="alert">
            {formError}
          </p>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending}>
          Añadir
        </Button>
      </form>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Eliminar género"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onClose={() => {
          if (!deleteMutation.isPending) {
            setPendingDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      >
        {pendingDelete ? (
          <p>
            Este género está asignado a {pendingDelete.affectedBookCount}{' '}
            {pendingDelete.affectedBookCount === 1 ? 'libro' : 'libros'}. Si lo borras,
            {pendingDelete.affectedBookCount === 1
              ? ' ese libro se quedará'
              : ' esos libros se quedarán'}{' '}
            sin género. ¿Continuar?
          </p>
        ) : null}
      </ConfirmModal>
    </Card>
  );
}
