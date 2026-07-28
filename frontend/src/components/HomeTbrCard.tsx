import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMonthlyTbr } from '../api/client';
import { formatMonthYear } from '../lib/locale';
import { TbrEntryRow } from './TbrEntryRow';
import { Card } from './ui';
import './HomeTbrCard.css';

function currentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

export function HomeTbrCard() {
  const { year, month } = currentYearMonth();
  const periodLabel = formatMonthYear(month, year);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tbr', year, month],
    queryFn: () => getMonthlyTbr(year, month),
  });

  return (
    <Card
      className="home-card home-tbr-card"
      title="TBR actual"
      subtitle={periodLabel}
    >
      {isLoading ? (
        <p className="home-tbr-card__status">Cargando TBR…</p>
      ) : null}

      {error ? (
        <p className="home-tbr-card__error" role="alert">
          No se pudo cargar la TBR.
        </p>
      ) : null}

      {data && data.entries.length === 0 ? (
        <p className="home-tbr-card__empty">
          No hay libros en tu lista de este mes.{' '}
          <Link to="/lists">Ir a Listas</Link>
        </p>
      ) : null}

      {data && data.entries.length > 0 ? (
        <>
          <ul
            className="tbr-checklist home-tbr-card__list"
            aria-label={`TBR de ${periodLabel}`}
          >
            {data.entries.map((entry) => (
              <TbrEntryRow key={entry.id} entry={entry} readOnly />
            ))}
          </ul>
          <p className="home-tbr-card__footer">
            <Link to="/lists">Gestionar en Listas</Link>
          </p>
        </>
      ) : null}
    </Card>
  );
}
