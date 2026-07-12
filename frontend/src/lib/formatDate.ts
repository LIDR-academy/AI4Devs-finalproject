// --------------------------------------------------------------------------
// Shared date formatting helpers.
//
// Deterministic — avoids the `new Date('YYYY-MM-DD')` UTC shift by parsing the
// parts and building a local-time Date / string from them.
// --------------------------------------------------------------------------

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Formats a "YYYY-MM-DD" string as e.g. "10 Jun 2030" (en-GB). */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Formats a "YYYY-MM-DD" string as e.g. "Jul 10". */
function formatDay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map((p) => parseInt(p, 10));
  if (!year || !month || !day) return isoDate;
  const monthName = MONTHS[month - 1] ?? '';
  return `${monthName} ${day}`;
}

/** Returns the 4-digit year from a "YYYY-MM-DD" string. */
function formatYear(isoDate: string): string {
  return isoDate.split('-')[0] ?? '';
}

/**
 * Formats a date range, collapsing the year to the end.
 * e.g. ("2026-07-10", "2026-07-13") → "Jul 10 – Jul 13, 2026".
 */
export function formatDateRange(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return '';
  return `${formatDay(checkIn)} – ${formatDay(checkOut)}, ${formatYear(checkOut)}`;
}
