import type { GenreCount } from '../../api/types';
import { ChartCard } from '../ui';
import { PieChart, type PieSlice } from './PieChart';
import './PieChart.css';

const GENRE_LABELS: Record<string, string> = {
  unknown: 'Sin género',
};

function genreLabel(genre: string): string {
  return GENRE_LABELS[genre] ?? genre;
}

interface GenrePieChartProps {
  distribution: GenreCount[];
  periodUnit: 'mes' | 'año';
}

export function GenrePieChart({ distribution, periodUnit }: GenrePieChartProps) {
  if (distribution.length === 0) {
    return null;
  }

  const slices: PieSlice[] = distribution.map((entry) => ({
    key: entry.genre,
    label: genreLabel(entry.genre),
    count: entry.count,
  }));

  return (
    <ChartCard
      className="genre-pie-chart"
      title="Distribución por género"
      subtitle={`Comparativa de libros leídos por género en el ${periodUnit}.`}
    >
      <PieChart slices={slices} />
    </ChartCard>
  );
}
