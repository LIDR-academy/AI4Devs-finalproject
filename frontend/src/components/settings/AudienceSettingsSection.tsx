import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import {
  createAudience,
  deleteAudience,
  getAudienceAffectedBookCount,
  listAudiences,
} from '../../api/client';
import { messageFromUnknownError } from '../../api/errors';
import { Button, Card, ConfirmModal, Input } from '../ui';
import './AudienceSettingsSection.css';

type PendingDelete = {
  id: string;
  name: string;
  affectedBookCount: number;
};

export function AudienceSettingsSection() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deletePreviewLoadingId, setDeletePreviewLoadingId] = useState<string | null>(
    null,
  );

  const { data: audiences = [], isLoading, error } = useQuery({
    queryKey: ['audiences'],
    queryFn: listAudiences,
  });

  const createMutation = useMutation({
    mutationFn: (audienceName: string) => createAudience(audienceName),
    onSuccess: () => {
      setName('');
      setFormError(null);
      void queryClient.invalidateQueries({ queryKey: ['audiences'] });
    },
    onError: (err) => {
      setFormError(messageFromUnknownError(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (audienceId: string) => deleteAudience(audienceId),
    onSuccess: () => {
      setPendingDelete(null);
      setDeleteError(null);
      void queryClient.invalidateQueries({ queryKey: ['audiences'] });
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

  async function handleDeleteClick(audienceId: string, audienceName: string) {
    setDeleteError(null);
    setDeletePreviewLoadingId(audienceId);

    try {
      const { affected_book_count } = await getAudienceAffectedBookCount(audienceId);

      if (affected_book_count === 0) {
        deleteMutation.mutate(audienceId);
        return;
      }

      setPendingDelete({
        id: audienceId,
        name: audienceName,
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
    <Card title="Público objetivo" className="audience-settings">
      <p className="audience-settings__intro">
        Personaliza las etiquetas de público objetivo para clasificar tus libros
        (infantil, juvenil, adulto, etc.).
      </p>

      {isLoading ? (
        <p className="audience-settings__status">Cargando elementos…</p>
      ) : null}
      {error ? (
        <p className="audience-settings__error" role="alert">
          No se pudieron cargar los elementos.
        </p>
      ) : null}
      {deleteError ? (
        <p className="audience-settings__error" role="alert">
          {deleteError}
        </p>
      ) : null}

      <ul className="audience-settings__list" aria-label="Público objetivo configurado">
        {audiences.map((audience) => (
          <li key={audience.id} className="audience-settings__item">
            <span className="audience-settings__name">
              {audience.name}
              {audience.is_default ? (
                <span className="audience-settings__badge">Predeterminada</span>
              ) : null}
            </span>
            <Button
              type="button"
              variant="ghost"
              className="audience-settings__delete"
              disabled={
                deleteMutation.isPending || deletePreviewLoadingId === audience.id
              }
              onClick={() => void handleDeleteClick(audience.id, audience.name)}
            >
              {deletePreviewLoadingId === audience.id ? 'Comprobando…' : 'Eliminar'}
            </Button>
          </li>
        ))}
      </ul>

      <form className="audience-settings__form" onSubmit={handleSubmit}>
        <Input
          label="Nuevo elemento"
          value={name}
          maxLength={100}
          placeholder="Ej. Juvenil"
          onChange={(event) => setName(event.target.value)}
        />
        {formError ? (
          <p className="audience-settings__error" role="alert">
            {formError}
          </p>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending}>
          Añadir elemento
        </Button>
      </form>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Eliminar público objetivo"
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
            Este elemento está asignado a {pendingDelete.affectedBookCount}{' '}
            {pendingDelete.affectedBookCount === 1 ? 'libro' : 'libros'}. Si lo borras,
            {pendingDelete.affectedBookCount === 1
              ? ' ese libro se quedará'
              : ' esos libros se quedarán'}{' '}
            sin público objetivo. ¿Continuar?
          </p>
        ) : null}
      </ConfirmModal>
    </Card>
  );
}
