import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { getMonthlyTbr, removeTbrEntry } from '../api/client';
import { messageFromUnknownError } from '../api/errors';
import { AddToTbrModal } from '../components/AddToTbrModal';
import { TbrEmptyState } from '../components/TbrEmptyState';
import { TbrEntryRow } from '../components/TbrEntryRow';
import { Button, PageHeader } from '../components/ui';
import { formatMonthName, formatMonthYear } from '../lib/locale';
import './ListsPage.css';

function currentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

export function ListsPage() {
  const queryClient = useQueryClient();
  const [yearMonth, setYearMonth] = useState(currentYearMonth);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { year, month } = yearMonth;

  const { data, isLoading, error } = useQuery({
    queryKey: ['tbr', year, month],
    queryFn: () => getMonthlyTbr(year, month),
  });

  const invalidateAfterAdd = () => {
    queryClient.invalidateQueries({ queryKey: ['tbr', year, month] });
    queryClient.invalidateQueries({ queryKey: ['books'] });
  };

  const removeMutation = useMutation({
    mutationFn: (entryId: string) => removeTbrEntry(year, month, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tbr', year, month] });
    },
  });

  const existingBookIds = useMemo(
    () => new Set(data?.entries.map((e) => e.book_id) ?? []),
    [data?.entries],
  );

  const shiftMonth = (delta: number) => {
    const d = new Date(Date.UTC(year, month - 1 + delta, 1));
    setYearMonth({
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
    });
  };

  const title = `TBR ${formatMonthYear(month, year)}`;

  return (
    <div className="lists-page">
      <PageHeader
        title={title}
        subtitle="Organiza tu TBR mensual y marca lecturas completadas."
        actions={
          data && data.entries.length > 0 ? (
            <Button type="button" onClick={() => setAddModalOpen(true)}>
              Añadir libros
            </Button>
          ) : null
        }
      />
      <header className="lists-header">
        <div className="lists-month-nav" role="group" aria-label="Navegación por mes">
          <Button
            type="button"
            variant="secondary"
            onClick={() => shiftMonth(-1)}
            aria-label="Mes anterior"
          >
            ←
          </Button>
          <span className="lists-month-nav__label">
            {formatMonthName(month)} {year}
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => shiftMonth(1)}
            aria-label="Mes siguiente"
          >
            →
          </Button>
        </div>
      </header>

      {isLoading && <p>Cargando TBR…</p>}
      {error && (
        <p className="lists-error" role="alert">
          No se pudo cargar la lista TBR.
        </p>
      )}
      {removeMutation.isError && (
        <p className="lists-error" role="alert">
          {messageFromUnknownError(removeMutation.error)}
        </p>
      )}

      {data && data.entries.length === 0 && (
        <TbrEmptyState onAddBooks={() => setAddModalOpen(true)} />
      )}

      {data && data.entries.length > 0 && (
        <ul className="tbr-checklist">
          {data.entries.map((entry) => (
            <TbrEntryRow
              key={entry.id}
              entry={entry}
              onRemove={(id) => removeMutation.mutate(id)}
              removing={removeMutation.isPending}
            />
          ))}
        </ul>
      )}

      <AddToTbrModal
        open={addModalOpen}
        year={year}
        month={month}
        existingBookIds={existingBookIds}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          invalidateAfterAdd();
        }}
      />
    </div>
  );
}
