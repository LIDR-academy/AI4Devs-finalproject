import type { QueryClient } from '@tanstack/react-query';
import type { ReadingRecordUpdateContext } from './goalsCacheInvalidation';

export interface YearMonth {
  year: number;
  month: number;
}

function utcYearMonthFromDate(
  isoDate: string | null | undefined,
  fallback: Date = new Date(),
): YearMonth {
  const ref = isoDate ? new Date(`${isoDate}T00:00:00Z`) : fallback;
  return { year: ref.getUTCFullYear(), month: ref.getUTCMonth() + 1 };
}

function sameMonth(a: YearMonth, b: YearMonth): boolean {
  return a.year === b.year && a.month === b.month;
}

export function affectedStatsMonths(
  ctx: ReadingRecordUpdateContext,
): YearMonth[] {
  const months: YearMonth[] = [];
  const add = (ym: YearMonth) => {
    if (!months.some((existing) => sameMonth(existing, ym))) {
      months.push(ym);
    }
  };

  const previousMonth = utcYearMonthFromDate(ctx.previousFinishedOn);
  const newMonth = utcYearMonthFromDate(ctx.finishedOn);

  if (ctx.previousStatus !== 'leido' && ctx.newStatus === 'leido') {
    add(newMonth);
  }

  if (ctx.previousStatus === 'leido' && ctx.newStatus !== 'leido') {
    add(previousMonth);
  }

  if (
    ctx.previousStatus === 'leido' &&
    ctx.newStatus === 'leido' &&
    ctx.previousFinishedOn !== ctx.finishedOn
  ) {
    add(previousMonth);
    add(newMonth);
  }

  return months;
}

export function affectedStatsYears(
  ctx: ReadingRecordUpdateContext,
): number[] {
  const years = new Set<number>();
  for (const { year } of affectedStatsMonths(ctx)) {
    years.add(year);
  }
  return [...years];
}

export function invalidateStatsForReadingUpdate(
  queryClient: QueryClient,
  ctx: ReadingRecordUpdateContext,
): void {
  for (const { year, month } of affectedStatsMonths(ctx)) {
    queryClient.invalidateQueries({ queryKey: ['stats', 'month', year, month] });
    queryClient.invalidateQueries({ queryKey: ['stats', year, month] });
  }
  for (const year of affectedStatsYears(ctx)) {
    queryClient.invalidateQueries({ queryKey: ['stats', 'year', year] });
  }
}
