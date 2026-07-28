import type { AudienceCount } from '../../api/types';
import { ChartCard } from '../ui';
import { PieChart, type PieSlice } from './PieChart';
import './PieChart.css';

const AUDIENCE_LABELS: Record<string, string> = {
  unknown: 'Sin público objetivo',
};

function audienceLabel(audience: string): string {
  return AUDIENCE_LABELS[audience] ?? audience;
}

interface AudiencePieChartProps {
  distribution: AudienceCount[];
}

export function AudiencePieChart({ distribution }: AudiencePieChartProps) {
  if (distribution.length === 0) {
    return null;
  }

  const slices: PieSlice[] = distribution.map((entry) => ({
    key: entry.audience,
    label: audienceLabel(entry.audience),
    count: entry.count,
  }));

  return (
    <ChartCard
      className="audience-pie-chart"
      title="Distribución por público objetivo"
      subtitle="Público objetivo de tus lecturas."
    >
      <PieChart slices={slices} />
    </ChartCard>
  );
}
