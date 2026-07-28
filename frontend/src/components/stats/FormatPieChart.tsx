import type { FormatCount } from '../../api/types';
import { ChartCard } from '../ui';
import { PieChart, type PieSlice } from './PieChart';
import './PieChart.css';

const FORMAT_LABELS: Record<string, string> = {
  fisico: 'Físico',
  ebook: 'Ebook',
  audio: 'Audio',
  unknown: 'Sin formato',
};

function formatLabel(format: string): string {
  return FORMAT_LABELS[format] ?? format;
}

interface FormatPieChartProps {
  distribution: FormatCount[];
  predominantFormat: string | null;
  periodUnit: 'mes' | 'año';
}

export function FormatPieChart({
  distribution,
  predominantFormat,
  periodUnit,
}: FormatPieChartProps) {
  if (distribution.length === 0) {
    return null;
  }

  const slices: PieSlice[] = distribution.map((entry) => ({
    key: entry.format,
    label: formatLabel(entry.format),
    count: entry.count,
    emphasized: entry.format === predominantFormat,
  }));

  return (
    <ChartCard
      className="format-pie-chart"
      title="Formato de lectura"
      subtitle={`Resumen de formatos leídos en el ${periodUnit}.`}
    >
      <PieChart slices={slices} />
    </ChartCard>
  );
}
