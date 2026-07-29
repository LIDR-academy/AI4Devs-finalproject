import type { QueryClient } from '@tanstack/react-query';
import type { ReadingStatus } from '../api/types';

export interface ReadingRecordUpdateContext {
  previousStatus: ReadingStatus;
  newStatus: ReadingStatus;
  previousFinishedOn?: string | null;
  finishedOn?: string | null;
}

function utcYearFromDate(
  isoDate: string | null | undefined,
  fallback: Date = new Date(),
): number {
  const ref = isoDate ? new Date(`${isoDate}T00:00:00Z`) : fallback;
  return ref.getUTCFullYear();
}

export function affectedGoalYears(ctx: ReadingRecordUpdateContext): number[] {
  const years = new Set<number>();
  const previousYear = utcYearFromDate(ctx.previousFinishedOn);
  const newYear = utcYearFromDate(ctx.finishedOn);

  if (ctx.previousStatus !== 'leido' && ctx.newStatus === 'leido') {
    years.add(newYear);
  }

  if (ctx.previousStatus === 'leido' && ctx.newStatus !== 'leido') {
    years.add(previousYear);
  }

  if (
    ctx.previousStatus === 'leido' &&
    ctx.newStatus === 'leido' &&
    ctx.previousFinishedOn !== ctx.finishedOn
  ) {
    years.add(previousYear);
    years.add(newYear);
  }

  return [...years];
}

export function invalidateGoalsForReadingUpdate(
  queryClient: QueryClient,
  ctx: ReadingRecordUpdateContext,
): void {
  for (const year of affectedGoalYears(ctx)) {
    queryClient.invalidateQueries({ queryKey: ['goals', year] });
  }
}
