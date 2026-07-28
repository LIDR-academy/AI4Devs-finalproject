import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getMonthlyStats, getYearlyStats } from '../api/client';
import type { StatsResponse } from '../api/types';
import { InsightsList } from '../components/stats/InsightsList';
import { CoverGallery } from '../components/stats/CoverGallery';
import { AudiencePieChart } from '../components/stats/AudiencePieChart';
import { BooksBarChart } from '../components/stats/BooksBarChart';
import { FormatPieChart } from '../components/stats/FormatPieChart';
import { GenrePieChart } from '../components/stats/GenrePieChart';
import { PagesBarChart } from '../components/stats/PagesBarChart';
import { RatingPieChart } from '../components/stats/RatingPieChart';
import {
  ChartSlotPlaceholder,
  StatsChartsGrid,
} from '../components/stats/StatsChartsGrid';
import '../components/stats/StatsChartsGrid.css';
import '../components/stats/PieChart.css';
import '../components/stats/BarChart.css';
import '../components/stats/CoverGallery.css';
import '../components/stats/InsightsList.css';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/ui';
import {
  loadStatsPeriod,
  parseMonthInputValue,
  saveStatsPeriod,
  toMonthInputValue,
  type StatsPeriod,
} from '../lib/statsPeriodStorage';
import { statsPeriodUnit } from '../lib/statsPeriodUnit';
import { APP_LOCALE } from '../lib/locale';
import { formatAverageRating } from '../lib/rating';
import './StatsPage.css';

function periodLabel(period: StatsPeriod): string {
  if (period.mode === 'year') {
    return `del año ${period.year}`;
  }
  const monthName = new Date(
    Date.UTC(period.year, period.month - 1, 1),
  ).toLocaleString(APP_LOCALE, { month: 'long', timeZone: 'UTC' });
  return `de ${monthName} ${period.year}`;
}

export function StatsPage() {
  const [period, setPeriod] = useState<StatsPeriod>(loadStatsPeriod);

  useEffect(() => {
    saveStatsPeriod(period);
  }, [period]);

  const { data, isLoading, error } = useQuery<StatsResponse>({
    queryKey:
      period.mode === 'year'
        ? ['stats', 'year', period.year]
        : ['stats', 'month', period.year, period.month],
    queryFn: () =>
      period.mode === 'year'
        ? getYearlyStats(period.year)
        : getMonthlyStats(period.year, period.month),
  });

  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = event.target.value as StatsPeriod['mode'];
    if (mode === 'year') {
      setPeriod({ mode: 'year', year: period.year });
      return;
    }
    const month =
      period.mode === 'month'
        ? period.month
        : new Date().getUTCMonth() + 1;
    setPeriod({ mode: 'month', year: period.year, month });
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const year = Number(event.target.value);
    if (!Number.isInteger(year) || year < 1970 || year > 2100) {
      return;
    }
    if (period.mode === 'year') {
      setPeriod({ mode: 'year', year });
      return;
    }
    setPeriod({ ...period, year });
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseMonthInputValue(event.target.value);
    if (parsed) {
      setPeriod({ mode: 'month', year: parsed.year, month: parsed.month });
    }
  };

  const isEmpty = data !== undefined && data.books_read === 0;
  const periodScope = periodLabel(period);
  const periodUnit = statsPeriodUnit(period);

  return (
    <div className="stats-page">
      <PageHeader
        title="Estadísticas de lectura"
        subtitle="Visualiza tus métricas y distribuciones de lectura por año o mes."
        actions={
          <div className="stats-period-filter" role="group" aria-label="Filtro de periodo">
            <label className="stats-period-filter__field" htmlFor="stats-period-mode">
              <span className="stats-period-filter__label">Periodo</span>
              <select
                id="stats-period-mode"
                className="stats-period-filter__input"
                value={period.mode}
                onChange={handleModeChange}
              >
                <option value="year">Año completo</option>
                <option value="month">Mes</option>
              </select>
            </label>

            {period.mode === 'year' ? (
              <label className="stats-period-filter__field" htmlFor="stats-period-year">
                <span className="stats-period-filter__label">Año</span>
                <input
                  id="stats-period-year"
                  className="stats-period-filter__input"
                  type="number"
                  min={1970}
                  max={2100}
                  step={1}
                  value={period.year}
                  onChange={handleYearChange}
                />
              </label>
            ) : (
              <label className="stats-period-filter__field" htmlFor="stats-period-month">
                <span className="stats-period-filter__label">Mes</span>
                <input
                  id="stats-period-month"
                  className="stats-period-filter__input"
                  type="month"
                  value={toMonthInputValue(period)}
                  onChange={handleMonthChange}
                />
              </label>
            )}
          </div>
        }
      />

      <main className="stats-main">
        {isLoading && <p aria-busy="true">Cargando estadísticas…</p>}

        {error && (
          <p role="alert" className="stats-error">
            No se pudieron cargar las estadísticas.
          </p>
        )}

        {data && !isLoading && !error && (
          <>
            <section
              className="stats-kpis"
              aria-label={`Indicadores ${periodScope}`}
            >
              <KpiCard
                label="Libros leídos"
                value={data.books_read.toLocaleString()}
              />
              <KpiCard
                label="Páginas leídas"
                value={data.pages_read.toLocaleString()}
              />
              <KpiCard
                label="Valoración media"
                value={formatAverageRating(data.average_rating)}
              />
            </section>

            {isEmpty ? (
              <p className="stats-empty">
                {period.mode === 'year'
                  ? `No hay libros marcados como leídos en ${period.year}.`
                  : 'No hay libros marcados como leídos en este mes.'}
              </p>
            ) : (
              <>
                <InsightsList
                  insights={data.insights}
                  periodScope={periodScope}
                />
                <StatsChartsGrid
                periodScope={periodScope}
                genreChart={
                  data.genre_distribution.length > 0 ? (
                    <GenrePieChart
                      distribution={data.genre_distribution}
                      periodUnit={periodUnit}
                    />
                  ) : (
                    <ChartSlotPlaceholder
                      title="Distribución por género"
                      subtitle={`Comparativa de libros leídos por género en el ${periodUnit}.`}
                      slotLabel="Gráfico de géneros"
                    />
                  )
                }
                formatChart={
                  data.format_distribution.length > 0 ? (
                    <FormatPieChart
                      distribution={data.format_distribution}
                      predominantFormat={data.predominant_format}
                      periodUnit={periodUnit}
                    />
                  ) : (
                    <ChartSlotPlaceholder
                      title="Formato de lectura"
                      subtitle={`Resumen de formatos leídos en el ${periodUnit}.`}
                      slotLabel="Gráfico de formatos"
                    />
                  )
                }
                audienceChart={
                  data.audience_distribution.length > 0 ? (
                    <AudiencePieChart
                      distribution={data.audience_distribution}
                    />
                  ) : (
                    <ChartSlotPlaceholder
                      title="Distribución por público objetivo"
                      subtitle="Público objetivo de tus lecturas."
                      slotLabel="Gráfico de público objetivo"
                    />
                  )
                }
                ratingChart={
                  data.rating_distribution.length > 0 ? (
                    <RatingPieChart
                      distribution={data.rating_distribution}
                      periodUnit={periodUnit}
                    />
                  ) : (
                    <ChartSlotPlaceholder
                      title="Distribución de puntuaciones"
                      subtitle={`Valoraciones asignadas en el ${periodUnit}.`}
                      slotLabel="Gráfico de puntuaciones"
                    />
                  )
                }
                booksBarChart={
                  period.mode === 'month' && 'monthly_breakdown' in data ? (
                    <BooksBarChart
                      mode="month"
                      selectedYear={data.year}
                      selectedMonth={data.month}
                      monthlyBreakdown={data.monthly_breakdown}
                    />
                  ) : period.mode === 'year' && 'yearly_breakdown' in data ? (
                    <BooksBarChart
                      mode="year"
                      selectedYear={data.year}
                      yearlyBreakdown={data.yearly_breakdown}
                    />
                  ) : (
                    <ChartSlotPlaceholder
                      title="Libros por mes"
                      subtitle="Evolución del volumen de lecturas."
                      slotLabel="Gráfico de barras de libros"
                    />
                  )
                }
                pagesBarChart={
                  period.mode === 'month' && 'monthly_breakdown' in data ? (
                    <PagesBarChart
                      mode="month"
                      selectedYear={data.year}
                      selectedMonth={data.month}
                      monthlyBreakdown={data.monthly_breakdown}
                    />
                  ) : period.mode === 'year' && 'yearly_breakdown' in data ? (
                    <PagesBarChart
                      mode="year"
                      selectedYear={data.year}
                      yearlyBreakdown={data.yearly_breakdown}
                    />
                  ) : (
                    <ChartSlotPlaceholder
                      title="Páginas por mes"
                      subtitle="Evolución de páginas leídas."
                      slotLabel="Gráfico de barras de páginas"
                    />
                  )
                }
              />
              {data.books_in_period.length > 0 && (
                <CoverGallery
                  books={data.books_in_period}
                  heading="Galería"
                  subtitle={`Libros terminados ${periodScope} (${data.books_in_period.length})`}
                  ariaLabel={`Portadas de libros leídos ${periodScope}`}
                />
              )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
