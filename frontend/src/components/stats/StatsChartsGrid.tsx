import type { ReactNode } from 'react';
import { ChartCard } from '../ui';
import './StatsChartsGrid.css';

export interface ChartSlotPlaceholderProps {
  title: string;
  subtitle: string;
  slotLabel: string;
}

export function ChartSlotPlaceholder({
  title,
  subtitle,
  slotLabel,
}: ChartSlotPlaceholderProps) {
  return (
    <ChartCard
      className="stats-chart-slot"
      title={title}
      subtitle={subtitle}
      aria-label={slotLabel}
    >
      <div
        className="stats-chart-slot__body"
        role="img"
        aria-label={`${slotLabel} — pendiente de implementación`}
      />
    </ChartCard>
  );
}

export interface StatsChartsGridProps {
  genreChart: ReactNode;
  formatChart: ReactNode;
  audienceChart: ReactNode;
  ratingChart: ReactNode;
  booksBarChart: ReactNode;
  pagesBarChart: ReactNode;
  periodScope: string;
}

export function StatsChartsGrid({
  genreChart,
  formatChart,
  audienceChart,
  ratingChart,
  booksBarChart,
  pagesBarChart,
  periodScope,
}: StatsChartsGridProps) {
  return (
    <section
      className="stats-charts-grid"
      aria-label={`Gráficos ${periodScope}`}
    >
      <div className="stats-charts-grid__pies" aria-label="Gráficos tipo quesito">
        <div className="stats-charts-grid__slot">{genreChart}</div>
        <div className="stats-charts-grid__slot">{formatChart}</div>
        <div className="stats-charts-grid__slot">{audienceChart}</div>
        <div className="stats-charts-grid__slot">{ratingChart}</div>
      </div>
      <div className="stats-charts-grid__bars" aria-label="Gráficos de barras">
        <div className="stats-charts-grid__slot">{booksBarChart}</div>
        <div className="stats-charts-grid__slot">{pagesBarChart}</div>
      </div>
    </section>
  );
}
