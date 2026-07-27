import type { ReadingStatus } from '../api/types';

export const READING_STATUS_OPTIONS: { value: ReadingStatus; label: string }[] =
  [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'leyendo', label: 'Leyendo' },
    { value: 'leido', label: 'Leído' },
    { value: 'dnf', label: 'DNF' },
  ];
