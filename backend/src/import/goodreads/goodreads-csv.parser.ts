import { BadRequestException } from '@nestjs/common';
import {
  GOODREADS_CSV_HEADERS,
  GOODREADS_REQUIRED_HEADERS,
  type GoodreadsCsvHeader,
} from './goodreads-csv.constants';
import { mapGoodreadsRows } from './goodreads-row.mapper';
import type {
  GoodreadsParsedRow,
  GoodreadsParseWarning,
  GoodreadsParsedUploadResult,
} from './goodreads-csv.types';

const UTF8_BOM = '\uFEFF';

/** Strip Goodreads/Excel `="…"` wrapper from ISBN fields. */
export function cleanGoodreadsIsbn(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  let cleaned = trimmed;
  if (cleaned.startsWith('="') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(2, -1);
  } else if (cleaned.startsWith('=')) {
    cleaned = cleaned.slice(1).replace(/^"|"$/g, '');
  }

  cleaned = cleaned.replace(/^"|"$/g, '').trim();
  return cleaned || null;
}

/** Parse one CSV record line with RFC-style double-quoted fields. */
export function parseCsvRecordLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

function normalizeHeader(value: string): string {
  return value.trim();
}

function fieldValue(
  values: string[],
  headerIndex: Map<string, number>,
  header: GoodreadsCsvHeader,
): string {
  const index = headerIndex.get(header);
  if (index === undefined) {
    return '';
  }
  return values[index]?.trim() ?? '';
}

function toParsedRow(
  rowNumber: number,
  values: string[],
  headerIndex: Map<string, number>,
): GoodreadsParsedRow {
  return {
    row_number: rowNumber,
    book_id: fieldValue(values, headerIndex, 'Book Id'),
    title: fieldValue(values, headerIndex, 'Title'),
    author: fieldValue(values, headerIndex, 'Author'),
    additional_authors: fieldValue(values, headerIndex, 'Additional Authors'),
    isbn: cleanGoodreadsIsbn(fieldValue(values, headerIndex, 'ISBN')),
    isbn13: cleanGoodreadsIsbn(fieldValue(values, headerIndex, 'ISBN13')),
    my_rating: fieldValue(values, headerIndex, 'My Rating'),
    average_rating: fieldValue(values, headerIndex, 'Average Rating'),
    publisher: fieldValue(values, headerIndex, 'Publisher'),
    binding: fieldValue(values, headerIndex, 'Binding'),
    number_of_pages: fieldValue(values, headerIndex, 'Number of Pages'),
    year_published: fieldValue(values, headerIndex, 'Year Published'),
    original_publication_year: fieldValue(
      values,
      headerIndex,
      'Original Publication Year',
    ),
    date_read: fieldValue(values, headerIndex, 'Date Read'),
    date_added: fieldValue(values, headerIndex, 'Date Added'),
    exclusive_shelf: fieldValue(values, headerIndex, 'Exclusive Shelf'),
    read_count: fieldValue(values, headerIndex, 'Read Count'),
    bookshelves: fieldValue(values, headerIndex, 'Bookshelves'),
  };
}

export function parseGoodreadsCsv(content: string): GoodreadsParsedUploadResult {
  const normalized = content.startsWith(UTF8_BOM)
    ? content.slice(UTF8_BOM.length)
    : content;

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new BadRequestException('CSV file is empty');
  }

  const headerFields = parseCsvRecordLine(lines[0]).map(normalizeHeader);
  const headerIndex = new Map<string, number>();
  headerFields.forEach((header, index) => {
    headerIndex.set(header, index);
  });

  const missingHeaders = GOODREADS_REQUIRED_HEADERS.filter(
    (header) => !headerIndex.has(header),
  );
  if (missingHeaders.length > 0) {
    throw new BadRequestException(
      `Missing required Goodreads CSV headers: ${missingHeaders.join(', ')}`,
    );
  }

  const expectedColumnCount = headerFields.length;
  const rows: GoodreadsParsedRow[] = [];
  const warnings: GoodreadsParseWarning[] = [];
  let skippedRows = 0;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const rowNumber = lineIndex + 1;
    const values = parseCsvRecordLine(lines[lineIndex]);

    if (values.length !== expectedColumnCount) {
      skippedRows += 1;
      warnings.push({
        row_number: rowNumber,
        code: 'COLUMN_COUNT_MISMATCH',
        message: `Se esperaban ${expectedColumnCount} columnas pero se encontraron ${values.length}`,
      });
      continue;
    }

    rows.push(toParsedRow(rowNumber, values, headerIndex));
  }

  const mapping = mapGoodreadsRows(rows);

  return {
    rows,
    mapped_rows: mapping.mapped_rows,
    warnings,
    mapping_warnings: mapping.mapping_warnings,
    meta: {
      total_rows: lines.length - 1,
      parsed_rows: rows.length,
      skipped_rows: skippedRows,
      mapped_rows: mapping.mapped_rows.length,
    },
  };
}

export function isStandardGoodreadsHeaderSet(headers: string[]): boolean {
  const normalized = headers.map(normalizeHeader);
  return GOODREADS_CSV_HEADERS.every((header) => normalized.includes(header));
}
