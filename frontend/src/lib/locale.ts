/** Spanish locale helpers for user-facing copy. */
export const APP_LOCALE = 'es-ES';

export const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

export function formatMonthYear(month: number, year: number): string {
  const name = MONTH_NAMES[month - 1] ?? String(month);
  return `${name} ${year}`;
}

export function formatMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}
