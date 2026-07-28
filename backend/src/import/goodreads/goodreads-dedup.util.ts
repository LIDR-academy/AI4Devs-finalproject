import type { GoodreadsImportBookDraft } from './goodreads-import.types';

/** Normalize text for case-insensitive duplicate matching. */
export function normalizeImportText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Build a stable dedup key: ISBN-13 when present, else title + authors. */
export function buildGoodreadsDedupKey(book: GoodreadsImportBookDraft): string {
  const isbn13 = book.isbn13?.trim();
  if (isbn13) {
    return `isbn13:${isbn13}`;
  }

  return `title:${normalizeImportText(book.title)}|authors:${normalizeImportText(book.authors)}`;
}

export function buildGoodreadsDedupKeyFromLibraryBook(book: {
  isbn13: string | null;
  title: string;
  authors: string;
}): string {
  return buildGoodreadsDedupKey({
    title: book.title,
    authors: book.authors,
    isbn10: null,
    isbn13: book.isbn13,
    page_count: null,
    publication_year: null,
    series_name: null,
    data_source: 'goodreads',
    external_provider_id: null,
  });
}
