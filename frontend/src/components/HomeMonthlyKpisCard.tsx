import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMonthlyStats } from '../api/client';
import { APP_LOCALE, formatMonthYear } from '../lib/locale';
import { formatAverageRating } from '../lib/rating';
import { KpiCard } from './KpiCard';
import { Card } from './ui';
import './HomeMonthlyKpisCard.css';

function currentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

export function HomeMonthlyKpisCard() {
  const { year, month } = currentYearMonth();
  const periodLabel = formatMonthYear(month, year);

  const { data, isLoading, error } = useQuery({
    queryKey: ['stats', 'month', year, month],
    queryFn: () => getMonthlyStats(year, month),
  });

  return (
    <Card
      className="home-card home-monthly-kpis"
      title="Datos del mes"
      subtitle={periodLabel}
    >
      {isLoading ? (
        <p className="home-monthly-kpis__status">Cargando estadísticas…</p>
      ) : null}

      {error ? (
        <p className="home-monthly-kpis__error" role="alert">
          No se pudieron cargar las estadísticas del mes.
        </p>
      ) : null}

      {data ? (
        <div className="home-monthly-kpis__body">
          <div
            className="home-monthly-kpis__grid"
            aria-label={`Indicadores de ${periodLabel}`}
          >
            <KpiCard
              label="Libros leídos"
              value={data.books_read.toLocaleString(APP_LOCALE)}
            />
            <KpiCard
              label="Páginas leídas"
              value={data.pages_read.toLocaleString(APP_LOCALE)}
            />
            <KpiCard
              label="Valoración media"
              value={formatAverageRating(data.average_rating)}
            />
          </div>
          {data.books_read === 0 ? (
            <p className="home-monthly-kpis__empty">
              Aún no has terminado ningún libro este mes.
            </p>
          ) : null}
          <p className="home-monthly-kpis__footer">
            <Link to="/stats">Ver estadísticas completas</Link>
          </p>
        </div>
      ) : null}
    </Card>
  );
}
