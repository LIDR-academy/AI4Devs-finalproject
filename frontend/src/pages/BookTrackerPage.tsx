import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { listBooks, patchReadingRecord } from '../api/client';
import { messageFromUnknownError } from '../api/errors';
import type { Book, ReadingRecordResource } from '../api/types';
import { AddBookModal } from '../components/AddBookModal';
import { BookFormModal } from '../components/BookFormModal';
import { BookTrackerRow } from '../components/BookTrackerRow';
import { CompletionModal } from '../components/CompletionModal';
import { Button, PageHeader, Table, TableScroll } from '../components/ui';
import {
  invalidateGoalsForReadingUpdate,
  type ReadingRecordUpdateContext,
} from '../lib/goalsCacheInvalidation';
import { invalidateStatsForReadingUpdate } from '../lib/statsCacheInvalidation';
import './BookTrackerPage.css';

export function BookTrackerPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [manualCreateOpen, setManualCreateOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [completionBookId, setCompletionBookId] = useState<string | null>(
    null,
  );
  const [completionReading, setCompletionReading] =
    useState<ReadingRecordResource | null>(null);
  const queryClient = useQueryClient();

  const { data: books = [], isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: listBooks,
  });

  const invalidateAfterReadingUpdate = (
    ctx: ReadingRecordUpdateContext & { tbrAutoCompleted?: boolean },
  ) => {
    queryClient.invalidateQueries({ queryKey: ['books'] });
    if (ctx.tbrAutoCompleted) {
      const ref = ctx.finishedOn
        ? new Date(`${ctx.finishedOn}T00:00:00Z`)
        : new Date();
      queryClient.invalidateQueries({
        queryKey: ['tbr', ref.getUTCFullYear(), ref.getUTCMonth() + 1],
      });
    }
    invalidateGoalsForReadingUpdate(queryClient, ctx);
    invalidateStatsForReadingUpdate(queryClient, ctx);
  };

  const completionMutation = useMutation({
    mutationFn: (payload: {
      finished_on: string;
      format_id?: string | null;
      rating?: number;
    }) => patchReadingRecord(completionBookId!, payload),
    onSuccess: (data) => {
      if (completionReading) {
        invalidateAfterReadingUpdate({
          previousStatus: completionReading.status,
          newStatus: data.reading.status,
          previousFinishedOn: completionReading.finished_on,
          finishedOn: data.reading.finished_on,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['books'] });
      }
      setCompletionBookId(null);
      setCompletionReading(null);
    },
  });

  const handleOpenCompletion = (
    bookId: string,
    reading: ReadingRecordResource,
  ) => {
    setCompletionBookId(bookId);
    setCompletionReading(reading);
  };

  const handleCompletionSave = (payload: {
    finished_on: string;
    format_id?: string | null;
    rating?: number;
  }) => {
    completionMutation.mutate(payload);
  };

  return (
    <div className="book-tracker">
      <PageHeader
        title="Book Tracker"
        actions={
          <Button type="button" onClick={() => setModalOpen(true)}>
            Añadir libro
          </Button>
        }
      />

      {isLoading && <p className="tracker-status">Cargando biblioteca…</p>}
      {error && (
        <p className="tracker-error" role="alert">
          No se pudo cargar la biblioteca.
        </p>
      )}
      {completionMutation.isError && (
        <p className="tracker-error" role="alert">
          {messageFromUnknownError(completionMutation.error)}
        </p>
      )}

      {!isLoading && books.length === 0 && (
        <p className="tracker-empty">
          Aún no tienes libros. Pulsa «Añadir libro» para empezar.
        </p>
      )}

      {!isLoading && books.length > 0 && (
        <TableScroll
          aria-label="Biblioteca de libros"
          className="books-table-scroll"
          tabIndex={0}
        >
          <Table className="books-table">
            <thead>
              <tr>
                <th scope="col" className="col-cover">
                  Portada
                </th>
                <th scope="col" className="col-title">
                  Título
                </th>
                <th scope="col" className="col-author">
                  Autora
                </th>
                <th scope="col" className="col-genre">
                  Género
                </th>
                <th scope="col" className="col-audience">
                  Público objetivo
                </th>
                <th scope="col" className="col-pages">
                  Páginas
                </th>
                <th scope="col" className="col-status">
                  Estado
                </th>
                <th scope="col" className="col-date">
                  Inicio
                </th>
                <th scope="col" className="col-date">
                  Fin
                </th>
                <th scope="col" className="col-format">
                  Formato
                </th>
                <th scope="col" className="col-rating">
                  Puntuación
                </th>
                <th scope="col" className="col-actions">
                  <span className="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <BookTrackerRow
                  key={book.id}
                  book={book}
                  onOpenCompletionModal={handleOpenCompletion}
                  onUpdated={invalidateAfterReadingUpdate}
                  onBookUpdated={() =>
                    queryClient.invalidateQueries({ queryKey: ['books'] })
                  }
                  onEditBook={setEditingBook}
                />
              ))}
            </tbody>
          </Table>
        </TableScroll>
      )}

      <AddBookModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['books'] })}
        onCreateManual={() => {
          setModalOpen(false);
          setManualCreateOpen(true);
        }}
      />

      <BookFormModal
        open={editingBook !== null || manualCreateOpen}
        mode={manualCreateOpen ? 'create' : 'edit'}
        book={manualCreateOpen ? null : editingBook}
        onClose={() => {
          setEditingBook(null);
          setManualCreateOpen(false);
        }}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['books'] })}
        onOpenCompletionModal={handleOpenCompletion}
      />

      <CompletionModal
        open={completionBookId !== null}
        reading={completionReading}
        saving={completionMutation.isPending}
        onClose={() => {
          setCompletionBookId(null);
          setCompletionReading(null);
        }}
        onSave={handleCompletionSave}
      />
    </div>
  );
}
