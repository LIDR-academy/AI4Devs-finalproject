import { useCallback, useEffect, useId, useState } from 'react';
import { createBook, patchBook, patchReadingRecord } from '../api/client';
import { messageFromUnknownError } from '../api/errors';
import type { Book, ReadingRecordResource } from '../api/types';
import {
  bookToFormState,
  buildCreateBookPayload,
  buildPatchBookPayload,
  buildReadingPatchPayload,
  emptyBookFormState,
  readingFieldsChanged,
  showFinishDateField,
  showRatingField,
  showStartDateField,
  validateBookForm,
  type BookFormFieldErrors,
  type BookFormState,
} from '../lib/bookForm';
import { AudienceSelect } from './AudienceSelect';
import { READING_STATUS_OPTIONS } from './readingStatus';
import { ReadFormatSelect } from './ReadFormatSelect';
import { Button, Input, Select, StarRating } from './ui';
import { Modal } from './ui/Modal';
import './BookFormModal.css';

export type BookFormMode = 'create' | 'edit';

export type BookFormModalProps = {
  open: boolean;
  mode: BookFormMode;
  book?: Book | null;
  onClose: () => void;
  onSaved?: () => void;
  onOpenCompletionModal?: (
    bookId: string,
    reading: ReadingRecordResource,
  ) => void;
};

export function BookFormModal({
  open,
  mode,
  book,
  onClose,
  onSaved,
  onOpenCompletionModal,
}: BookFormModalProps) {
  const formId = useId();
  const [form, setForm] = useState<BookFormState>(emptyBookFormState());
  const [fieldErrors, setFieldErrors] = useState<BookFormFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      mode === 'edit' && book ? bookToFormState(book) : emptyBookFormState(),
    );
    setFieldErrors({});
    setFormError(null);
  }, [open, mode, book]);

  const setField = useCallback(
    <K extends keyof BookFormState>(key: K, value: BookFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const modalTitle =
    mode === 'edit' && book
      ? `Editar libro — ${book.title}`
      : 'Añadir libro manualmente';

  const handleSave = async () => {
    const errors = validateBookForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (mode === 'create') {
        const created = await createBook(buildCreateBookPayload(form));
        const readingPatch = buildReadingPatchPayload(form);
        const needsReadingPatch =
          form.status !== 'pendiente' ||
          readingPatch.started_on != null ||
          readingPatch.finished_on != null ||
          form.format_id != null ||
          readingPatch.rating != null;

        if (needsReadingPatch) {
          const readingRes = await patchReadingRecord(
            created.book.id,
            readingPatch,
          );
          if (readingRes.meta?.openCompletionModal) {
            onOpenCompletionModal?.(created.book.id, readingRes.reading);
          }
        }
      } else if (book) {
        await patchBook(book.id, buildPatchBookPayload(form));
        if (readingFieldsChanged(book, form)) {
          const readingRes = await patchReadingRecord(
            book.id,
            buildReadingPatchPayload(form),
          );
          if (readingRes.meta?.openCompletionModal) {
            onOpenCompletionModal?.(book.id, readingRes.reading);
          }
        }
      }

      onSaved?.();
      onClose();
    } catch (err: unknown) {
      setFormError(messageFromUnknownError(err));
    } finally {
      setSaving(false);
    }
  };

  const showStart = showStartDateField(form.status);
  const showFinish = showFinishDateField(form.status);
  const showRating = showRatingField(form.status);

  return (
    <Modal
      open={open}
      title={modalTitle}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={saving} onClick={() => void handleSave()}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="book-form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        {formError ? (
          <p className="book-form__error" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="book-form__grid">
          <Input
            label="Título"
            value={form.title}
            required
            disabled={saving}
            aria-invalid={fieldErrors.title ? true : undefined}
            onChange={(e) => setField('title', e.target.value)}
          />
          {fieldErrors.title ? (
            <span className="book-form__field-error">{fieldErrors.title}</span>
          ) : null}

          <Input
            label="Autora"
            value={form.authors}
            required
            disabled={saving}
            aria-invalid={fieldErrors.authors ? true : undefined}
            onChange={(e) => setField('authors', e.target.value)}
          />
          {fieldErrors.authors ? (
            <span className="book-form__field-error">{fieldErrors.authors}</span>
          ) : null}

          <Input
            label="Portada (URL)"
            type="url"
            value={form.cover_image_url}
            disabled={saving}
            aria-invalid={fieldErrors.cover_image_url ? true : undefined}
            onChange={(e) => setField('cover_image_url', e.target.value)}
          />
          {fieldErrors.cover_image_url ? (
            <span className="book-form__field-error">
              {fieldErrors.cover_image_url}
            </span>
          ) : null}

          <Input
            label="Género"
            value={form.genre}
            disabled={saving}
            onChange={(e) => setField('genre', e.target.value)}
          />

          <div className="ui-field book-form__full-width">
            <label className="ui-field__label" htmlFor={`${formId}-notes`}>
              Notas / etiquetas
            </label>
            <textarea
              id={`${formId}-notes`}
              className="ui-input book-form__textarea"
              rows={3}
              value={form.notes}
              disabled={saving}
              onChange={(e) => setField('notes', e.target.value)}
            />
          </div>

          <AudienceSelect
            id={`${formId}-audience`}
            label="Público objetivo"
            value={form.audience_id}
            disabled={saving}
            onChange={(value) => setField('audience_id', value)}
          />

          <Input
            label="Páginas"
            type="number"
            min={0}
            value={form.page_count}
            disabled={saving}
            aria-invalid={fieldErrors.page_count ? true : undefined}
            onChange={(e) => setField('page_count', e.target.value)}
          />
          {fieldErrors.page_count ? (
            <span className="book-form__field-error">{fieldErrors.page_count}</span>
          ) : null}

          <Input
            label="Año de publicación"
            type="number"
            min={1000}
            max={2100}
            value={form.publication_year}
            disabled={saving}
            aria-invalid={fieldErrors.publication_year ? true : undefined}
            onChange={(e) => setField('publication_year', e.target.value)}
          />
          {fieldErrors.publication_year ? (
            <span className="book-form__field-error">
              {fieldErrors.publication_year}
            </span>
          ) : null}

          <Input
            label="Saga"
            value={form.series_name}
            disabled={saving}
            onChange={(e) => setField('series_name', e.target.value)}
          />

          <Select
            label="Estado"
            value={form.status}
            disabled={saving}
            onChange={(e) =>
              setField('status', e.target.value as BookFormState['status'])
            }
          >
            {READING_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          {showStart ? (
            <Input
              label="Fecha de inicio"
              type="date"
              value={form.started_on}
              disabled={saving}
              onChange={(e) => setField('started_on', e.target.value)}
            />
          ) : null}

          {showFinish ? (
            <>
              <Input
                label="Fecha de fin"
                type="date"
                value={form.finished_on}
                disabled={saving}
                aria-invalid={fieldErrors.finished_on ? true : undefined}
                onChange={(e) => setField('finished_on', e.target.value)}
              />
              {fieldErrors.finished_on ? (
                <span className="book-form__field-error">
                  {fieldErrors.finished_on}
                </span>
              ) : null}
            </>
          ) : null}

          <ReadFormatSelect
            id={`${formId}-format`}
            label="Formato"
            value={form.format_id}
            disabled={saving}
            onChange={(value) => setField('format_id', value)}
          />

          {showRating ? (
            <div className="ui-field book-form__full-width">
              <span className="ui-field__label">Puntuación</span>
              <StarRating
                value={form.rating}
                disabled={saving}
                aria-label="Puntuación del libro"
                onChange={(rating) => setField('rating', rating)}
              />
            </div>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
