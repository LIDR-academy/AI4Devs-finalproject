import type { GenreCount } from '../api/types';
import { ChartCard } from './ui';

interface GenreDistributionChartProps {
  distribution: GenreCount[];
  periodUnit?: 'mes' | 'año';
}

const GENRE_LABELS: Record<string, string> = {
  unknown: 'Sin género',
};

function genreLabel(genre: string): string {
  return GENRE_LABELS[genre] ?? genre;
}

export function GenreDistributionChart({
  distribution,
  periodUnit = 'mes',
}: GenreDistributionChartProps) {
  if (distribution.length === 0) {
    return null;
  }

  const max = Math.max(...distribution.map((entry) => entry.count));

  return (
    <ChartCard
      className="genre-chart"
      title="Distribución por género"
      subtitle={`Comparativa de libros leídos por género en el ${periodUnit}.`}
    >
      <ul className="genre-chart__list">
        {distribution.map((entry) => {
          const widthPercent = max > 0 ? (entry.count / max) * 100 : 0;
          return (
            <li key={entry.genre} className="genre-chart__row">
              <span className="genre-chart__label">
                {genreLabel(entry.genre)}
              </span>
              <span className="genre-chart__bar-track">
                <span
                  className="genre-chart__bar-fill"
                  style={{ width: `${widthPercent}%` }}
                  role="img"
                  aria-label={`${genreLabel(entry.genre)}: ${entry.count}`}
                />
              </span>
              <span className="genre-chart__count">{entry.count}</span>
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}
