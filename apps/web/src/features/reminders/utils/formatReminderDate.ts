export function formatReminderDate(iso: string | null): string {
  if (!iso) {
    return '—';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('es-CR', { dateStyle: 'medium' });
}

export function formatReminderDateTime(iso: string | null): string {
  if (!iso) {
    return '—';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
