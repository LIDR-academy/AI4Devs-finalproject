import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { patchBook, patchReadingRecord } from '../api/client';
import { messageFromUnknownError } from '../api/errors';
import type {
  Book,
  ReadingRecordPatchedResponse,
  ReadingRecordResource,
} from '../api/types';
import type { ReadingRecordUpdateContext } from '../lib/goalsCacheInvalidation';
import { InlineDateField } from './InlineDateField';
import { AudienceSelect } from './AudienceSelect';
import { ReadFormatSelect } from './ReadFormatSelect';
import { ReadingStatusSelect } from './ReadingStatusSelect';
import { StarRating } from './StarRating';

interface BookTrackerRowProps {
  book: Book;
  onOpenCompletionModal: (
    bookId: string,
    reading: ReadingRecordResource,
  ) => void;
  onUpdated: (
    ctx: ReadingRecordUpdateContext & { tbrAutoCompleted?: boolean },
  ) => void;
  onBookUpdated: () => void;
  onEditBook: (book: Book) => void;
}

export function BookTrackerRow({
  book,
  onOpenCompletionModal,
  onUpdated,
  onBookUpdated,
  onEditBook,
}: BookTrackerRowProps) {
  const [fieldError, setFieldError] = useState<string | null>(null);

  const status = book.reading_status ?? 'pendiente';
  const showStartDate =
    status === 'leyendo' || status === 'leido' || status === 'dnf';
  const showFinishDate = status === 'leido';
  const showRating = status === 'leido';

  const mutation = useMutation({
    mutationFn: (body: Parameters<typeof patchReadingRecord>[1]) =>
      patchReadingRecord(book.id, body),
    onSuccess: (data: ReadingRecordPatchedResponse) => {
      setFieldError(null);
      if (data.meta?.openCompletionModal) {
        onOpenCompletionModal(book.id, data.reading);
      }
      onUpdated({
        tbrAutoCompleted: data.meta?.tbrAutoCompleted,
        previousStatus: status,
        newStatus: data.reading.status,
        previousFinishedOn: book.finished_on,
        finishedOn: data.reading.finished_on,
      });
    },
    onError: (err) => {
      setFieldError(messageFromUnknownError(err));
    },
  });

  const bookMutation = useMutation({
    mutationFn: (audienceId: string | null) =>
      patchBook(book.id, { audience_id: audienceId }),
    onSuccess: () => {
      setFieldError(null);
      onBookUpdated();
    },
    onError: (err) => {
      setFieldError(messageFromUnknownError(err));
    },
  });

  const patch = (body: Parameters<typeof patchReadingRecord>[1]) => {
    mutation.mutate(body);
  };

  return (
    <tr>
      <td className="col-cover">
        {book.cover_image_url ? (
          <img src={book.cover_image_url} alt="" className="table-cover" />
        ) : (
          <span className="no-cover">—</span>
        )}
      </td>
      <td className="col-title" title={book.title}>
        {book.title}
      </td>
      <td className="col-author">{book.authors}</td>
      <td className="col-genre">{book.genre ?? '—'}</td>
      <td className="col-audience audience-cell">
        <AudienceSelect
          id={`audience-${book.id}`}
          label={`Público objetivo de ${book.title}`}
          className="audience-select--inline"
          value={book.audience_id}
          disabled={mutation.isPending || bookMutation.isPending}
          onChange={(next) => bookMutation.mutate(next)}
        />
      </td>
      <td className="col-pages">{book.page_count ?? '—'}</td>
      <td className="col-status status-cell">
        <ReadingStatusSelect
          value={status}
          disabled={mutation.isPending}
          onChange={(next) => patch({ status: next })}
        />
        {fieldError && (
          <span className="row-error" role="alert">
            {fieldError}
          </span>
        )}
      </td>
      <td className="col-date">
        {showStartDate ? (
          <InlineDateField
            label="Fecha de inicio"
            value={book.started_on}
            disabled={mutation.isPending}
            onChange={(started_on) => patch({ started_on })}
          />
        ) : (
          '—'
        )}
      </td>
      <td className="col-date">
        {showFinishDate ? (
          <InlineDateField
            label="Fecha de fin"
            value={book.finished_on}
            disabled={mutation.isPending}
            onChange={(finished_on) => patch({ finished_on })}
          />
        ) : (
          '—'
        )}
      </td>
      <td className="col-format format-cell">
        <ReadFormatSelect
          id={`format-${book.id}`}
          label={`Formato de ${book.title}`}
          className="read-format-select--inline"
          value={book.format_id}
          disabled={mutation.isPending || bookMutation.isPending}
          onChange={(next) => patch({ format_id: next })}
        />
      </td>
      <td className="col-rating">
        {showRating ? (
          <StarRating
            value={book.rating}
            disabled={mutation.isPending}
            onChange={(rating) => patch({ rating })}
          />
        ) : (
          '—'
        )}
      </td>
      <td className="col-actions actions-cell">
        <button
          type="button"
          className="row-edit-btn"
          aria-label={`Editar ${book.title}`}
          disabled={mutation.isPending || bookMutation.isPending}
          onClick={() => onEditBook(book)}
        >
          <svg aria-hidden="true" className="row-edit-icon" viewBox="0 0 24 24" focusable="false">
            <path
              fill="currentColor"
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm18.71-11.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}
