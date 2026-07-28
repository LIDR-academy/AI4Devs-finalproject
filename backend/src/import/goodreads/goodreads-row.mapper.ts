import type { ReadingStatus } from '../../books/entities/reading-record.entity';
import type { GoodreadsParsedRow } from './goodreads-csv.types';
import type {
  GoodreadsMappedRow,
  GoodreadsMappingResult,
  GoodreadsMappingWarning,
} from './goodreads-import.types';

/** Convert Goodreads `YYYY/MM/DD` to ISO `YYYY-MM-DD`. */
export function parseGoodreadsDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const year = match[1];
  const month = match[2].padStart(2, '0');
  const day = match[3].padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function mapExclusiveShelfToStatus(
  exclusiveShelf: string,
): ReadingStatus | null {
  switch (exclusiveShelf.trim().toLowerCase()) {
    case 'read':
      return 'leido';
    case 'to-read':
      return 'pendiente';
    case 'currently-reading':
      return 'leyendo';
    default:
      return null;
  }
}

export function mapBindingToReadFormat(
  binding: string,
): 'fisico' | 'ebook' | 'audio' | null {
  const normalized = binding.trim().toLowerCase();
  if (!normalized || normalized === 'unknown' || normalized === 'unknown binding') {
    return null;
  }

  if (normalized.includes('kindle') || normalized === 'ebook') {
    return 'ebook';
  }

  if (normalized.includes('audible') || normalized.includes('audiobook')) {
    return 'audio';
  }

  if (
    normalized.includes('paperback') ||
    normalized.includes('hardcover') ||
    normalized.includes('mass market') ||
    normalized.includes('bolsillo') ||
    normalized.includes('tapa') ||
    normalized.includes('library binding')
  ) {
    return 'fisico';
  }

  return null;
}

export function mapGoodreadsRating(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const rating = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return rating;
}

function parseOptionalYear(
  primary: string,
  fallback: string,
): number | null {
  for (const candidate of [primary, fallback]) {
    const trimmed = candidate.trim();
    if (!trimmed) {
      continue;
    }

    const year = Number.parseInt(trimmed, 10);
    if (Number.isFinite(year) && year > 0 && year <= 9999) {
      return year;
    }
  }

  return null;
}

function parsePageCount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const pages = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(pages) || pages <= 0) {
    return null;
  }

  return pages;
}

function mapStartedOn(
  status: ReadingStatus,
  dateAdded: string | null,
  dateRead: string | null,
): string | null {
  if (status !== 'leido' && status !== 'leyendo') {
    return null;
  }

  if (!dateAdded) {
    return null;
  }

  if (dateRead && dateAdded > dateRead) {
    return null;
  }

  return dateAdded;
}

function mapFinishedOn(
  status: ReadingStatus,
  dateRead: string | null,
): string | null {
  if (status !== 'leido') {
    return null;
  }

  return dateRead;
}

export function mapGoodreadsRow(
  row: GoodreadsParsedRow,
): { mapped: GoodreadsMappedRow | null; warning: GoodreadsMappingWarning | null } {
  const title = row.title.trim();
  if (!title) {
    return {
      mapped: null,
      warning: {
        row_number: row.row_number,
        code: 'MISSING_TITLE',
        message: 'Fila omitida porque el título está vacío',
      },
    };
  }

  const status = mapExclusiveShelfToStatus(row.exclusive_shelf);
  if (!status) {
    return {
      mapped: null,
      warning: {
        row_number: row.row_number,
        code: 'UNKNOWN_EXCLUSIVE_SHELF',
        message: `Estantería exclusiva no reconocida: ${row.exclusive_shelf}`,
      },
    };
  }

  const dateRead = parseGoodreadsDate(row.date_read);
  const dateAdded = parseGoodreadsDate(row.date_added);

  return {
    mapped: {
      row_number: row.row_number,
      book: {
        title,
        authors: row.author.trim(),
        isbn10: row.isbn,
        isbn13: row.isbn13,
        page_count: parsePageCount(row.number_of_pages),
        publication_year: parseOptionalYear(
          row.original_publication_year,
          row.year_published,
        ),
        data_source: 'goodreads',
        external_provider_id: row.book_id.trim() || null,
      },
      reading_record: {
        status,
        rating: mapGoodreadsRating(row.my_rating),
        read_format: mapBindingToReadFormat(row.binding),
        started_on: mapStartedOn(status, dateAdded, dateRead),
        finished_on: mapFinishedOn(status, dateRead),
      },
    },
    warning: null,
  };
}

export function mapGoodreadsRows(rows: GoodreadsParsedRow[]): GoodreadsMappingResult {
  const mapped_rows: GoodreadsMappedRow[] = [];
  const mapping_warnings: GoodreadsMappingWarning[] = [];

  for (const row of rows) {
    const { mapped, warning } = mapGoodreadsRow(row);
    if (mapped) {
      mapped_rows.push(mapped);
    }
    if (warning) {
      mapping_warnings.push(warning);
    }
  }

  return { mapped_rows, mapping_warnings };
}
