import type { RatingCount } from '../../api/types';
import { formatRatingLabel } from '../../lib/rating';
import { ChartCard } from '../ui';
import { PieChart, type PieSlice } from './PieChart';
import './PieChart.css';

interface RatingPieChartProps {
  distribution: RatingCount[];
  periodUnit: 'mes' | 'año';
}

export function RatingPieChart({ distribution, periodUnit }: RatingPieChartProps) {
  if (distribution.length === 0) {
    return null;
  }

  const slices: PieSlice[] = distribution.map((entry) => ({
    key: String(entry.rating),
    label: formatRatingLabel(entry.rating),
    count: entry.count,
  }));

  return (
    <ChartCard
      className="rating-pie-chart"
      title="Distribución de puntuaciones"
      subtitle={`Valoraciones asignadas en el ${periodUnit}.`}
    >
      <PieChart slices={slices} />
    </ChartCard>
  );
}
