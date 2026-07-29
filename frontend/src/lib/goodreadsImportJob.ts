import type { ImportJobStatus } from '../api/types';

const PHASE_LABELS: Record<ImportJobStatus, string> = {
  queued: 'Preparando importación',
  parsing: 'Analizando CSV',
  importing: 'Importando libros',
  enriching: 'Enriqueciendo metadatos',
  completed: 'Importación completada',
  failed: 'Importación fallida',
};

export function formatImportJobProgressLabel(
  phase: ImportJobStatus,
  processedCount: number,
  totalCount: number,
): string {
  const label = PHASE_LABELS[phase] ?? 'Importando biblioteca';
  if (totalCount > 0 && phase !== 'queued' && phase !== 'parsing') {
    return `${label}… ${processedCount} / ${totalCount}`;
  }
  return `${label}…`;
}

export function importJobProgressPercent(
  processedCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((processedCount / totalCount) * 100));
}
