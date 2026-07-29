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
): BarChartBar[] {
  return breakdown.map((entry) => ({
    key: String(entry.month),
    label: shortMonthLabel(entry.month),
    value: entry.books_read,
    emphasized: entry.month === selectedMonth,
  }));
}

function yearBars(
  breakdown: YearBucket[],
  selectedYear: number,
): BarChartBar[] {
  return breakdown.map((entry) => ({
    key: String(entry.year),
    label: String(entry.year),
    value: entry.books_read,
    emphasized: entry.year === selectedYear,
  }));
}

interface BooksBarChartProps {
  mode: 'month' | 'year';
  selectedYear: number;
  selectedMonth?: number;
  monthlyBreakdown?: MonthBucket[];
  yearlyBreakdown?: YearBucket[];
}

export function BooksBarChart({
  mode,
  selectedYear,
  selectedMonth,
  monthlyBreakdown,
  yearlyBreakdown,
}: BooksBarChartProps) {
  const bars =
    mode === 'month' && monthlyBreakdown
      ? monthBars(monthlyBreakdown, selectedMonth ?? 1)
      : yearlyBreakdown
        ? yearBars(yearlyBreakdown, selectedYear)
        : [];

  if (bars.length === 0) {
    return null;
  }

  return (
    <ChartCard
      className="books-bar-chart"
      title={mode === 'year' ? 'Libros por año' : 'Libros por mes'}
      subtitle="Evolución del volumen de lecturas."
    >
      <BarChart
        bars={bars}
        valueLabel="libros leídos"
        bucketUnit={mode === 'year' ? 'año' : 'mes'}
      />
    </ChartCard>
  );
}
