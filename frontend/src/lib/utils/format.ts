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

export function extractPrice(text: string): number | null {
  const patterns = [
    /(\d{1,3}(?:\.\d{3})*)\s*(?:€|EUR|euros)/i,
    /precio[:\s]*(\d{1,3}(?:\.\d{3})*)/i,
    /(\d{1,3}(?:\.\d{3})*)\s*€/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1].replace(/\./g, ''), 10);
  }
  return null;
}

export function extractSquareMeters(text: string): number | null {
  const patterns = [
    /(\d+)\s*m[²2]/i,
    /(\d+)\s*metros?\s*(?:cuadrados|construidos)/i,
    /superficie[:\s]*(\d+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

export function extractBedrooms(text: string): number | null {
  const patterns = [
    /(\d+)\s*(?:hab|dormitorio|habitacione)s?/i,
    /(\d+)\s*hab\.?/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

export interface ExtractedFields {
  price: number | null;
  squareMeters: number | null;
  bedrooms: number | null;
}

export function extractFields(text: string): ExtractedFields {
  return {
    price: extractPrice(text),
    squareMeters: extractSquareMeters(text),
    bedrooms: extractBedrooms(text),
  };
}
