import type { StatsPeriod } from './statsPeriodStorage';

/** Spanish unit noun for the active stats filter (`mes` / `año`). */
export function statsPeriodUnit(period: Pick<StatsPeriod, 'mode'>): 'mes' | 'año' {
  return period.mode === 'year' ? 'año' : 'mes';
}
