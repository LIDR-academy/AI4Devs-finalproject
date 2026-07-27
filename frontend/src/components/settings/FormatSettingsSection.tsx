import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import {
  createFormat,
  deleteFormat,
  getFormatAffectedReadingCount,
  listFormats,
} from '../../api/client';
import { messageFromUnknownError } from '../../api/errors';
import { Button, Card, ConfirmModal, Input } from '../ui';
import './FormatSettingsSection.css';

type PendingDelete = {
  id: string;
  name: string;
  affectedReadingCount: number;
};

export function FormatSettingsSection() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deletePreviewLoadingId, setDeletePreviewLoadingId] = useState<string | null>(
    null,
  );

  const { data: formats = [], isLoading, error } = useQuery({
    queryKey: ['formats'],
    queryFn: listFormats,
  });

  const createMutation = useMutation({
    mutationFn: (formatName: string) => createFormat(formatName),
    onSuccess: () => {
      setName('');
      setFormError(null);
      void queryClient.invalidateQueries({ queryKey: ['formats'] });
    },
    onError: (err) => {
      setFormError(messageFromUnknownError(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (formatId: string) => deleteFormat(formatId),
    onSuccess: () => {
      setPendingDelete(null);
      setDeleteError(null);
      void queryClient.invalidateQueries({ queryKey: ['formats'] });
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
      setFormError('Introduce un nombre para el elemento.');
      return;
    }
    setFormError(null);
    createMutation.mutate(trimmed);
  }

  async function handleDeleteClick(formatId: string, formatName: string) {
    setDeleteError(null);
    setDeletePreviewLoadingId(formatId);

    try {
      const { affected_reading_count } = await getFormatAffectedReadingCount(formatId);

      if (affected_reading_count === 0) {
        deleteMutation.mutate(formatId);
        return;
      }

      setPendingDelete({
        id: formatId,
        name: formatName,
        affectedReadingCount: affected_reading_count,
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
    <Card title="Formato" className="format-settings">
      <p className="format-settings__intro">
        Personaliza las etiquetas de formato de lectura para clasificar cómo lees
        cada libro (físico, ebook, audio, etc.).
      </p>

      {isLoading ? (
        <p className="format-settings__status">Cargando elementos…</p>
      ) : null}
      {error ? (
        <p className="format-settings__error" role="alert">
          No se pudieron cargar los elementos.
        </p>
      ) : null}
      {deleteError ? (
        <p className="format-settings__error" role="alert">
          {deleteError}
        </p>
      ) : null}

      <ul className="format-settings__list" aria-label="Formatos configurados">
        {formats.map((format) => (
          <li key={format.id} className="format-settings__item">
            <span className="format-settings__name">
              {format.name}
              {format.is_default ? (
                <span className="format-settings__badge">Predeterminado</span>
              ) : null}
            </span>
            <Button
              type="button"
              variant="ghost"
              className="format-settings__delete"
              disabled={
                deleteMutation.isPending || deletePreviewLoadingId === format.id
              }
              onClick={() => void handleDeleteClick(format.id, format.name)}
            >
              {deletePreviewLoadingId === format.id ? 'Comprobando…' : 'Eliminar'}
            </Button>
          </li>
        ))}
      </ul>

      <form className="format-settings__form" onSubmit={handleSubmit}>
        <Input
          label="Nuevo elemento"
          value={name}
          maxLength={100}
          placeholder="Ej. Audiolibro por capítulos"
          onChange={(event) => setName(event.target.value)}
        />
        {formError ? (
          <p className="format-settings__error" role="alert">
            {formError}
          </p>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending}>
          Añadir elemento
        </Button>
      </form>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Eliminar formato"
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
            Este formato está asignado a {pendingDelete.affectedReadingCount}{' '}
            {pendingDelete.affectedReadingCount === 1 ? 'lectura' : 'lecturas'}. Si lo
            borras,
            {pendingDelete.affectedReadingCount === 1
              ? ' esa lectura se quedará'
              : ' esas lecturas se quedarán'}{' '}
            sin formato. ¿Continuar?
          </p>
        ) : null}
      </ConfirmModal>
    </Card>
  );
}
