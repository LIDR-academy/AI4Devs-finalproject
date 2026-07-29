import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { upsertAnnualGoal } from '../api/client';
import { messageFromUnknownError } from '../api/errors';
import type { AnnualGoalResponse } from '../api/types';
import './AnnualGoalCard.css';

function forecastMessage(
  forecast: NonNullable<AnnualGoalResponse['forecast']>,
): string {
  if (forecast.status === 'ahead') {
    return 'Vas adelantada respecto a tu objetivo.';
  }
  if (forecast.status === 'behind') {
    return `Necesitas unos ${forecast.required_books_per_week} libros/semana para cumplir la meta.`;
  }
  return 'Vas a buen ritmo para cumplir tu meta.';
}

interface AnnualGoalCardProps {
  year: number;
  data: AnnualGoalResponse | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function AnnualGoalCard({
  year,
  data,
  isLoading,
  error,
}: AnnualGoalCardProps) {
  const queryClient = useQueryClient();
  const [draftTarget, setDraftTarget] = useState('');
  const [editing, setEditing] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (target: number) => upsertAnnualGoal(year, target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', year] });
      setEditing(false);
      setDraftTarget('');
    },
  });

  const startEdit = () => {
    setDraftTarget(
      data?.goal ? String(data.goal.target_book_count) : '',
    );
    setEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number.parseInt(draftTarget, 10);
    if (Number.isNaN(value) || value < 1) {
      return;
    }
    saveMutation.mutate(value);
  };

  if (isLoading) {
    return (
      <section className="annual-goal-card" aria-busy="true">
        <p>Cargando meta anual…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="annual-goal-card annual-goal-card--error">
        <p role="alert">No se pudo cargar la meta anual.</p>
      </section>
    );
  }

  const goal = data?.goal ?? null;
  const booksRead = data?.books_read ?? 0;
  const progressPercent = data?.progress_percent ?? 0;
  const forecast = data?.forecast ?? null;

  return (
    <section className="annual-goal-card" aria-labelledby="annual-goal-heading">
      <header className="annual-goal-card__header">
        <h2 id="annual-goal-heading">Meta anual {year}</h2>
        {goal && !editing && (
          <button type="button" className="btn-link" onClick={startEdit}>
            Editar
          </button>
        )}
      </header>

      {!goal || editing ? (
        <form className="annual-goal-form" onSubmit={handleSubmit}>
          <label htmlFor="target-books">
            Libros que quieres leer este año
          </label>
          <div className="annual-goal-form__row">
            <input
              id="target-books"
              type="number"
              min={1}
              max={365}
              required
              value={draftTarget}
              onChange={(e) => setDraftTarget(e.target.value)}
            />
            <button
              type="submit"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
          {saveMutation.isError && (
            <p className="annual-goal-error" role="alert">
              {messageFromUnknownError(saveMutation.error)}
            </p>
          )}
        </form>
      ) : (
        <>
          <p className="annual-goal-progress" aria-live="polite">
            <span className="annual-goal-progress__count">
              {booksRead} / {goal.target_book_count}
            </span>
            <span className="annual-goal-progress__percent">
              {progressPercent}%
            </span>
          </p>
          <div
            className="annual-goal-bar"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso hacia la meta anual"
          >
            <div
              className="annual-goal-bar__fill"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          {forecast ? (
            <p className="annual-goal-forecast">{forecastMessage(forecast)}</p>
          ) : (
            <p className="annual-goal-forecast annual-goal-forecast--muted">
              Marca libros como leídos para ver una predicción de cumplimiento.
            </p>
          )}
        </>
      )}
    </section>
  );
}
