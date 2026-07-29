import type { GoodreadsImportMeta, GoodreadsImportResponse } from '../api/types';

export interface ImportSummaryStats {
  imported_count: number;
  skipped_duplicate_count: number;
  skipped_invalid_count: number;
  missing_finished_on_count: number;
  enrichment_failed_count: number;
}

export interface ImportSummaryLine {
  key: keyof ImportSummaryStats;
  label: string;
  count: number;
}

function countMissingFinishedOn(result: GoodreadsImportResponse): number {
  const importedRows = new Set(
    (result.imported ?? []).map((row) => row.row_number),
  );
  if (importedRows.size === 0 || !result.mapped_rows) {
    return 0;
  }

  return result.mapped_rows.filter(
    (row) =>
      importedRows.has(row.row_number) &&
      row.reading_record.status === 'leido' &&
      !row.reading_record.finished_on,
  ).length;
}

export function buildImportSummaryStats(
  result: GoodreadsImportResponse,
): ImportSummaryStats {
  const meta: GoodreadsImportMeta = result.meta;

  return {
    imported_count: meta.imported_count,
    skipped_duplicate_count: meta.skipped_duplicate_count,
    skipped_invalid_count: meta.skipped_invalid_count,
    missing_finished_on_count: countMissingFinishedOn(result),
    enrichment_failed_count: meta.enrichment_failed_count ?? 0,
  };
}

export function buildImportSummaryLines(
  stats: ImportSummaryStats,
): ImportSummaryLine[] {
  const lines: ImportSummaryLine[] = [
    {
      key: 'imported_count',
      label: stats.imported_count === 1 ? 'libro importado' : 'libros importados',
      count: stats.imported_count,
    },
    {
      key: 'skipped_duplicate_count',
      label:
        stats.skipped_duplicate_count === 1
          ? 'duplicado omitido'
          : 'duplicados omitidos',
      count: stats.skipped_duplicate_count,
    },
    {
      key: 'skipped_invalid_count',
      label:
        stats.skipped_invalid_count === 1
          ? 'fila descartada (sin título)'
          : 'filas descartadas (sin título)',
      count: stats.skipped_invalid_count,
    },
    {
      key: 'missing_finished_on_count',
      label:
        stats.missing_finished_on_count === 1
          ? 'libro leído sin fecha de fin'
          : 'libros leídos sin fecha de fin',
      count: stats.missing_finished_on_count,
    },
    {
      key: 'enrichment_failed_count',
      label:
        stats.enrichment_failed_count === 1
          ? 'libro sin portada/género en catálogo'
          : 'libros sin portada/género en catálogo',
      count: stats.enrichment_failed_count,
    },
  ];

  return lines.filter((line) => line.count > 0 || line.key === 'imported_count');
}
