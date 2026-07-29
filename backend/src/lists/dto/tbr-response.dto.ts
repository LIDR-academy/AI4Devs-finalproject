import { ReadingStatus } from '../../books/entities/reading-record.entity';

export class TbrBookSummaryDto {
  id: string;
  title: string;
  authors: string;
  cover_image_url: string | null;
  reading_status: ReadingStatus;
}

export class TbrEntryDto {
  id: string;
  book_id: string;
  sort_order: number;
  completed: boolean;
  completed_at: string | null;
  added_at: string;
  book: TbrBookSummaryDto;
}

export class MonthlyTbrListDto {
  id: string;
  year: number;
  month: number;
  auto_created: boolean;
  created_at: string;
  updated_at: string;
}

export class MonthlyTbrResponseDto {
  list: MonthlyTbrListDto;
  entries: TbrEntryDto[];
}

export class AddTbrEntryDto {
  book_id: string;
}
