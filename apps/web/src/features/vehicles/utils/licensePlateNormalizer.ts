export function normalizeLicensePlate(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase();
}
