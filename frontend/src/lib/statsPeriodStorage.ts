const STORAGE_KEY = 'stats_period_v1';

export type StatsPeriod =
  | { mode: 'year'; year: number }
  | { mode: 'month'; year: number; month: number };

export function currentUtcYear(): number {
  return new Date().getUTCFullYear();
}

export function defaultStatsPeriod(): StatsPeriod {
  return { mode: 'year', year: currentUtcYear() };
}

function isValidMonth(month: number): boolean {
  return Number.isInteger(month) && month >= 1 && month <= 12;
}

function isValidYear(year: number): boolean {
  return Number.isInteger(year) && year >= 1970 && year <= 2100;
}

function parseStoredPeriod(raw: unknown): StatsPeriod | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const value = raw as Record<string, unknown>;
  if (value.mode === 'year' && isValidYear(value.year as number)) {
    return { mode: 'year', year: value.year as number };
  }
  if (
    value.mode === 'month' &&
    isValidYear(value.year as number) &&
    isValidMonth(value.month as number)
  ) {
    return {
      mode: 'month',
      year: value.year as number,
      month: value.month as number,
    };
  }
  return null;
}

export function loadStatsPeriod(): StatsPeriod {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultStatsPeriod();
    }
    const parsed = parseStoredPeriod(JSON.parse(raw));
    return parsed ?? defaultStatsPeriod();
  } catch {
    return defaultStatsPeriod();
  }
}

export function saveStatsPeriod(period: StatsPeriod): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(period));
}

export function toMonthInputValue(period: Extract<StatsPeriod, { mode: 'month' }>): string {
  return `${period.year}-${String(period.month).padStart(2, '0')}`;
}

export function parseMonthInputValue(
  value: string,
): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!isValidYear(year) || !isValidMonth(month)) {
    return null;
  }
  return { year, month };
}
