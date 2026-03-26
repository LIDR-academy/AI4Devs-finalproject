/**
 * Date utility functions
 * Handles formatting dates in relative format for the UI
 */

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formats a date string to a relative format
 * Examples: "Hoy", "Ayer", "Hace 2 días", "Hace 1 semana", "En 3 días"
 * @param dateString - ISO date string
 * @returns Formatted relative date string
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);

  // Validate date: check if it's invalid
  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  const now = new Date();

  // Compute day-only UTC timestamps to avoid timezone off-by-ones
  const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = nowUtc - dateUtc;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Handle future dates
  if (diffDays < 0) {
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  }

  // Handle past dates
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  // Fallback for older dates
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}
