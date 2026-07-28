import type { MonthBucket, YearBucket } from '../../api/types';
import { ChartCard } from '../ui';
import { BarChart, type BarChartBar } from './BarChart';
import './BarChart.css';

function shortMonthLabel(month: number): string {
  return new Date(Date.UTC(2000, month - 1, 1)).toLocaleString(undefined, {
    month: 'short',
    timeZone: 'UTC',
  });
}

function monthBars(
  breakdown: MonthBucket[],
  selectedMonth: number,
  valueKey: 'books_read' | 'pages_read',
): BarChartBar[] {
  return breakdown.map((entry) => ({
    key: String(entry.month),
    label: shortMonthLabel(entry.month),
    value: entry[valueKey],
    emphasized: entry.month === selectedMonth,
  }));
}

function yearBars(
  breakdown: YearBucket[],
  selectedYear: number,
  valueKey: 'books_read' | 'pages_read',
): BarChartBar[] {
  return breakdown.map((entry) => ({
    key: String(entry.year),
    label: String(entry.year),
    value: entry[valueKey],
    emphasized: entry.year === selectedYear,
  }));
}

interface PagesBarChartProps {
  mode: 'month' | 'year';
  selectedYear: number;
  selectedMonth?: number;
  monthlyBreakdown?: MonthBucket[];
  yearlyBreakdown?: YearBucket[];
}

export function PagesBarChart({
  mode,
  selectedYear,
  selectedMonth,
  monthlyBreakdown,
  yearlyBreakdown,
}: PagesBarChartProps) {
  const bars =
    mode === 'month' && monthlyBreakdown
      ? monthBars(monthlyBreakdown, selectedMonth ?? 1, 'pages_read')
      : yearlyBreakdown
        ? yearBars(yearlyBreakdown, selectedYear, 'pages_read')
        : [];

  if (bars.length === 0) {
    return null;
  }

  return (
    <ChartCard
      className="pages-bar-chart"
      title={mode === 'year' ? 'Páginas por año' : 'Páginas por mes'}
      subtitle="Evolución de páginas leídas."
    >
      <BarChart
        bars={bars}
        valueLabel="páginas leídas"
        bucketUnit={mode === 'year' ? 'año' : 'mes'}
      />
    </ChartCard>
  );
}
