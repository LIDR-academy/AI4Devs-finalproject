import type { GoodreadsParsedUploadResult } from './goodreads/goodreads-csv.types';
import type {
  GoodreadsImportedRow,
  GoodreadsEnrichmentFailedRow,
  GoodreadsImportSkippedRow,
  GoodreadsImportSummary,
} from './goodreads/goodreads-import.types';

export interface UploadedCsvFile {
  buffer: Buffer;
  size: number;
  originalname?: string;
  mimetype?: string;
}

export interface GoodreadsImportResult extends GoodreadsParsedUploadResult {
  imported: GoodreadsImportedRow[];
  skipped_rows: GoodreadsImportSkippedRow[];
  enrichment_failed: GoodreadsEnrichmentFailedRow[];
  meta: GoodreadsParsedUploadResult['meta'] & GoodreadsImportSummary['meta'];
}
