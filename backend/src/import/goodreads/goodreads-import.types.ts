import type { DataSourceType } from '../../books/entities/book.entity';
import type { ReadingStatus } from '../../books/entities/reading-record.entity';

export interface GoodreadsImportBookDraft {
  title: string;
  authors: string;
  isbn10: string | null;
  isbn13: string | null;
  page_count: number | null;
  publication_year: number | null;
  series_name: string | null;
  data_source: DataSourceType;
  external_provider_id: string | null;
}

export interface GoodreadsImportReadingRecordDraft {
  status: ReadingStatus;
  rating: number | null;
  read_format: 'fisico' | 'ebook' | 'audio' | null;
  started_on: string | null;
  finished_on: string | null;
}

export interface GoodreadsMappedRow {
  row_number: number;
  book: GoodreadsImportBookDraft;
  reading_record: GoodreadsImportReadingRecordDraft;
}

export interface GoodreadsMappingWarning {
  row_number: number;
  code: string;
  message: string;
}

import type { GoodreadsImportProgressUpdate } from '../import-job.types';
import type { GenreResolutionMap } from '../../genres/genre-resolution.types';

export interface GoodreadsImportProcessOptions {
  onProgress?: (
    progress: GoodreadsImportProgressUpdate,
  ) => void | Promise<void>;
  genreResolutions?: GenreResolutionMap;
}

export interface GoodreadsMappingResult {
  mapped_rows: GoodreadsMappedRow[];
  mapping_warnings: GoodreadsMappingWarning[];
}

export interface GoodreadsImportSkippedRow {
  row_number: number;
  code: string;
  message: string;
  existing_book_id?: string;
}

export interface GoodreadsImportedRow {
  row_number: number;
  book_id: string;
}

export interface GoodreadsEnrichmentFailedRow {
  row_number: number;
  book_id: string;
  code: 'ENRICHMENT_CATALOG_MISS';
  message: string;
}

export interface GoodreadsImportSummary {
  imported: GoodreadsImportedRow[];
  skipped_rows: GoodreadsImportSkippedRow[];
  enrichment_failed: GoodreadsEnrichmentFailedRow[];
  meta: {
    imported_count: number;
    skipped_duplicate_count: number;
    skipped_invalid_count: number;
    enrichment_failed_count: number;
  };
}
