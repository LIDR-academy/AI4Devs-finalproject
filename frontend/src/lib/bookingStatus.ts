import type { BookingStatus } from '@/types';

const STATUS_TOKENS: Record<BookingStatus, string> = {
  confirmed: 'bg-terracotta-tint text-terracotta',
  cancelled: 'border border-border bg-surface text-taupe',
  completed: 'bg-canvas text-taupe',
};

/** Full className for a booking-status pill badge (editorial tokens). */
export function bookingStatusBadgeClass(status: BookingStatus): string {
  return `rounded-pill px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${STATUS_TOKENS[status]}`;
}
