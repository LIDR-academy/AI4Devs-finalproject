import type { AudienceType } from '../api/types';

export const AUDIENCE_OPTIONS: { value: AudienceType; label: string }[] = [
  { value: 'young_adult', label: 'Juvenil' },
  { value: 'new_adult', label: 'New Adult' },
  { value: 'adult', label: 'Adulto' },
];

export function formatAudience(value: AudienceType | null | undefined): string {
  if (!value) return '—';
  return AUDIENCE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
