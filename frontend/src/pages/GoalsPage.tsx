import { useQuery } from '@tanstack/react-query';
import { getAnnualGoal } from '../api/client';
import type { AnnualGoalResponse, GoalForecast } from '../api/types';
import { AnnualGoalCard } from '../components/AnnualGoalCard';
import { Card, PageHeader } from '../components/ui';
import './GoalsPage.css';

function currentUtcYear(): number {
  return new Date().getUTCFullYear();
}

function booksLabel(count: number): string {
  return count === 1 ? 'libro' : 'libros';
}

function formatPace(pace: number): string {
  return pace.toLocaleString('es-ES', {
    maximumFractionDigits: 1,
    minimumFractionDigits: pace % 1 === 0 ? 0 : 1,
  });
}

function ForecastProjectionCard({
  year,
  data,
  isLoading,
  error,
}: {
  year: number;
  data: AnnualGoalResponse | undefined;
  isLoading: boolean;
  error: Error | null;
}) {
  if (isLoading) {
    return (
      <Card title="Previsión" className="goals-side-card">
        <p className="goals-side-card__text goals-side-card__text--muted">
          Calculando proyección…
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Previsión" className="goals-side-card">
        <p className="goals-side-card__text" role="alert">
          No se pudo calcular la previsión.
        </p>
      </Card>
    );
  }

  const forecast = data?.forecast ?? null;
  const goalTarget = data?.goal?.target_book_count;

  if (!forecast) {
    return (
      <Card title="Previsión" className="goals-side-card">
        <p className="goals-side-card__text">
          {data?.goal
            ? 'Cuando lleves al menos una semana de lecturas este año, estimaremos cuántos libros terminarás si mantienes el ritmo.'
            : 'Define tu meta anual y marca libros como leídos para ver una proyección a fin de año.'}
        </p>
      </Card>
    );
  }

  return (
    <Card title="Previsión" className="goals-side-card">
      <ForecastProjectionBody
        year={year}
        forecast={forecast}
        goalTarget={goalTarget}
      />
    </Card>
  );
}

function ForecastProjectionBody({
  year,
  forecast,
  goalTarget,
}: {
  year: number;
  forecast: GoalForecast;
  goalTarget: number | undefined;
}) {
  const projected = forecast.projected_year_end_count;
  const pace = formatPace(forecast.pace_books_per_week);

  let vsGoal: string | null = null;
  if (goalTarget !== undefined) {
    if (projected > goalTarget) {
      const extra = projected - goalTarget;
      vsGoal = `Superarías tu meta de ${goalTarget} por ${extra} ${booksLabel(extra)}.`;
    } else if (projected < goalTarget) {
      const shortfall = goalTarget - projected;
      vsGoal = `Te quedarías a ${shortfall} ${booksLabel(shortfall)} de tu meta de ${goalTarget}.`;
    } else {
      vsGoal = `Encajarías exactamente con tu meta de ${goalTarget} ${booksLabel(goalTarget)}.`;
    }
  }

  return (
    <>
      <p className="goals-side-card__projection" aria-live="polite">
        <span className="goals-side-card__projection-count">{projected}</span>
        <span className="goals-side-card__projection-label">
          {booksLabel(projected)} previstos en {year}
        </span>
      </p>
      <p className="goals-side-card__text">
        Si mantienes tu ritmo actual ({pace} libros/semana),
        terminarás el año con unos {projected} {booksLabel(projected)}.
      </p>
      {vsGoal && (
        <p className="goals-side-card__text goals-side-card__text--muted">
          {vsGoal}
        </p>
      )}
    </>
  );
}

export function GoalsPage() {
  const year = currentUtcYear();
  const { data, isLoading, error } = useQuery({
    queryKey: ['goals', year],
    queryFn: () => getAnnualGoal(year),
  });

  return (
    <div className="goals-page">
      <PageHeader
        title="Metas"
        subtitle="Configura tu meta anual y sigue tu progreso lector."
      />

      <main className="goals-main" aria-label="Resumen de metas anuales">
        <section className="goals-main__primary" aria-label={`Detalle de la meta ${year}`}>
          <AnnualGoalCard
            year={year}
            data={data}
            isLoading={isLoading}
            error={error}
          />
        </section>

        <ForecastProjectionCard
          year={year}
          data={data}
          isLoading={isLoading}
          error={error}
        />
      </main>
    </div>
  );
}
