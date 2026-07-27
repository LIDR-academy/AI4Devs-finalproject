import { DataSourceType, AudienceType } from '../entities/book.entity';
import { ReadingStatus } from '../entities/reading-record.entity';

export class BookDto {
  id: string;
  user_id: string;
  title: string;
  authors: string;
  isbn_13: string | null;
  isbn_10: string | null;
  cover_image_url: string | null;
  page_count: number | null;
  genre: string | null;
  series_name: string | null;
  publication_year: number | null;
  data_source: DataSourceType;
  external_provider_id: string | null;
  notes: string | null;
  audience: AudienceType | null;
  audience_id: string | null;
  created_at: string;
  updated_at: string;
}

export class ReadingRecordSummaryDto {
  book_id: string;
  status: ReadingStatus;
}

export class BookCreatedResponseDto {
  book: BookDto;
  reading: ReadingRecordSummaryDto;
}

export class BookListItemDto extends BookDto {
  reading_status: ReadingStatus;
  started_on: string | null;
  finished_on: string | null;
  rating: number | null;
  format_id: string | null;
  read_format: string | null;
}
