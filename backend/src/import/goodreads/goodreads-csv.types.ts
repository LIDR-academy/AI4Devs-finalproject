import type {
  GoodreadsMappedRow,
  GoodreadsMappingWarning,
} from './goodreads-import.types';

export interface GoodreadsParsedRow {
  row_number: number;
  book_id: string;
  title: string;
  author: string;
  additional_authors: string;
  isbn: string | null;
  isbn13: string | null;
  my_rating: string;
  average_rating: string;
  publisher: string;
  binding: string;
  number_of_pages: string;
  year_published: string;
  original_publication_year: string;
  date_read: string;
  date_added: string;
  exclusive_shelf: string;
  read_count: string;
  bookshelves: string;
}

export interface GoodreadsParseWarning {
  row_number: number | null;
  code: string;
  message: string;
}

export interface GoodreadsParsedUploadResult {
  rows: GoodreadsParsedRow[];
  mapped_rows: GoodreadsMappedRow[];
  warnings: GoodreadsParseWarning[];
  mapping_warnings: GoodreadsMappingWarning[];
  meta: {
    total_rows: number;
    parsed_rows: number;
    skipped_rows: number;
    mapped_rows: number;
  };
}
