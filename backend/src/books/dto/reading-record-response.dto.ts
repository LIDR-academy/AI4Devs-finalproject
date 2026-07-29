import { ReadingStatus } from '../entities/reading-record.entity';

export class ReadingRecordResourceDto {
  book_id: string;
  status: ReadingStatus;
  current_page: number | null;
  progress_percent: string | null;
  rating: number | null;
  format_id: string | null;
  read_format: string | null;
  started_on: string | null;
  finished_on: string | null;
  updated_at: string;
}

export class PatchSideEffectsMetaDto {
  openCompletionModal?: boolean;
  tbrAutoCompleted?: boolean;
}

export class ReadingRecordPatchedResponseDto {
  reading: ReadingRecordResourceDto;
  book: { id: string; page_count: number | null };
  meta?: PatchSideEffectsMetaDto;
}
