import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  format,
  formatDistanceToNow,
  fromUnixTime,
  addDays,
  isAfter,
} from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "d MMM yyyy, HH:mm", { locale: es });
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) return '—';
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
}

export function formatCurrency(amount: string, currency: string): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
}

export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return '—';
  return e164;
}

export function formatFullName(
  firstName: string | null,
  lastName: string | null,
): string {
  return [firstName, lastName].filter(Boolean).join(' ') || '—';
}

export function isExpiringSoon(
  expiresAtUnix: number,
  daysThreshold = 7,
): boolean {
  return !isAfter(fromUnixTime(expiresAtUnix), addDays(new Date(), daysThreshold));
}

export function formatExpiryDate(expiresAtUnix: number): string {
  return format(fromUnixTime(expiresAtUnix), "d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
}
