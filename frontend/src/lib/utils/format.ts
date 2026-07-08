export function formatCurrency(value: number, currency = 'EUR', locale = 'es-ES'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function formatDate(value: string | Date, locale = 'es-ES'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'var(--color-success)';
  if (score >= 50) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

export function scoreLabelEs(score: number): string {
  if (score >= 90) return 'Excelente';
  if (score >= 70) return 'Alta';
  if (score >= 50) return 'Media';
  return 'Baja';
}
