export type DataSource =
  | 'open_library'
  | 'google_books'
  | 'goodreads'
  | 'manual';

export type AudienceType = 'young_adult' | 'new_adult' | 'adult';

export type ReadingStatus = 'pendiente' | 'leyendo' | 'leido' | 'dnf';

export type ReadFormat = 'fisico' | 'ebook' | 'audio';

export interface Audience {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Format {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AudienceAffectedBooksResponse {
  affected_book_count: number;
}

export interface CatalogEdition {
  title: string;
  authors: string;
  cover_image_url: string | null;
  page_count: number | null;
  genre: string | null;
  isbn_13: string | null;
  isbn_10: string | null;
  data_source: 'open_library' | 'google_books';
  external_provider_id: string;
}

export interface CatalogSearchResponse {
  items: CatalogEdition[];
  source: 'open_library' | 'google_books' | 'none';
}

export interface CoverOption {
  id: string;
  url: string;
  label: string | null;
}

export interface EditionCoversResponse {
  covers: CoverOption[];
  default_cover_id: string | null;
}

export interface Book {
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
  data_source: DataSource;
  external_provider_id: string | null;
  notes: string | null;
  audience: AudienceType | null;
  audience_id: string | null;
  created_at: string;
  updated_at: string;
  reading_status?: ReadingStatus;
  started_on?: string | null;
  finished_on?: string | null;
  rating?: number | null;
  format_id?: string | null;
  read_format?: ReadFormat | null;
}

export interface PatchReadingRecordPayload {
  status?: ReadingStatus;
  started_on?: string;
  finished_on?: string;
  rating?: number;
  format_id?: string | null;
}

export interface ReadingRecordResource {
  book_id: string;
  status: ReadingStatus;
  current_page: number | null;
  progress_percent: string | null;
  rating: number | null;
  format_id: string | null;
  read_format: ReadFormat | null;
  started_on: string | null;
  finished_on: string | null;
  updated_at: string;
}

export interface PatchSideEffectsMeta {
  openCompletionModal?: boolean;
  tbrAutoCompleted?: boolean;
}

export interface ReadingRecordPatchedResponse {
  reading: ReadingRecordResource;
  book: { id: string; page_count: number | null };
  meta?: PatchSideEffectsMeta;
}

export interface MonthlyTbrList {
  id: string;
  year: number;
  month: number;
  auto_created: boolean;
  created_at: string;
  updated_at: string;
}

export interface TbrBookSummary {
  id: string;
  title: string;
  authors: string;
  cover_image_url: string | null;
  reading_status: ReadingStatus;
}

export interface TbrEntry {
  id: string;
  book_id: string;
  sort_order: number;
  completed: boolean;
  completed_at: string | null;
  added_at: string;
  book: TbrBookSummary;
}

export interface MonthlyTbrResponse {
  list: MonthlyTbrList;
  entries: TbrEntry[];
}

export type GoalForecastStatus = 'ahead' | 'on_track' | 'behind';

export interface GoalForecast {
  projected_year_end_count: number;
  on_track: boolean;
  pace_books_per_week: number;
  required_books_per_week: number;
  status: GoalForecastStatus;
}

export interface AnnualGoalResource {
  id: string;
  target_book_count: number;
  created_at: string;
  updated_at: string;
}

export interface AnnualGoalResponse {
  year: number;
  goal: AnnualGoalResource | null;
  books_read: number;
  progress_percent: number | null;
  forecast: GoalForecast | null;
}

export interface GenreCount {
  genre: string;
  count: number;
}

export interface FormatCount {
  format: string;
  count: number;
}

export interface AudienceCount {
  audience: string;
  count: number;
}

export interface RatingCount {
  rating: number;
  count: number;
}

export interface MonthBucket {
  month: number;
  books_read: number;
  pages_read: number;
}

export interface YearBucket {
  year: number;
  books_read: number;
  pages_read: number;
}

export interface PeriodBookSummary {
  id: string;
  title: string;
  authors: string;
  cover_image_url: string | null;
  finished_on: string;
}

export type StatsInsightKind =
  | 'volume_delta'
  | 'genre_trend'
  | 'format_mix'
  | 'pages_milestone'
  | 'rating_pattern'
  | 'other';

export interface StatsInsight {
  id: string;
  kind: StatsInsightKind;
  title: string;
  body: string;
  data?: Record<string, string | number | boolean | null>;
}

export interface MonthlyStatsResponse {
  year: number;
  month: number;
  books_read: number;
  pages_read: number;
  average_rating: number | null;
  genre_distribution: GenreCount[];
  format_distribution: FormatCount[];
  predominant_format: string | null;
  audience_distribution: AudienceCount[];
  rating_distribution: RatingCount[];
  monthly_breakdown: MonthBucket[];
  books_in_period: PeriodBookSummary[];
  insights: StatsInsight[];
}

export interface YearlyStatsResponse {
  year: number;
  books_read: number;
  pages_read: number;
  average_rating: number | null;
  genre_distribution: GenreCount[];
  format_distribution: FormatCount[];
  predominant_format: string | null;
  audience_distribution: AudienceCount[];
  rating_distribution: RatingCount[];
  yearly_breakdown: YearBucket[];
  books_in_period: PeriodBookSummary[];
  insights: StatsInsight[];
}

export type StatsResponse = MonthlyStatsResponse | YearlyStatsResponse;

export interface CreateBookPayload {
  title: string;
  authors: string;
  isbn_13?: string | null;
  isbn_10?: string | null;
  cover_image_url?: string | null;
  page_count?: number | null;
  genre?: string | null;
  series_name?: string | null;
  publication_year?: number | null;
  data_source: DataSource;
  external_provider_id?: string | null;
  notes?: string | null;
  audience?: AudienceType | null;
  audience_id?: string | null;
}

export interface PatchBookPayload {
  title?: string;
  authors?: string;
  cover_image_url?: string | null;
  page_count?: number | null;
  genre?: string | null;
  series_name?: string | null;
  publication_year?: number | null;
  audience?: AudienceType | null;
  audience_id?: string | null;
  notes?: string | null;
}

export interface BookCreatedResponse {
  book: Book;
  reading: { book_id: string; status: string };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  code?: string;
  existingBookId?: string;
}

export interface GoodreadsImportMeta {
  total_rows: number;
  parsed_rows: number;
  skipped_rows: number;
  mapped_rows: number;
  imported_count: number;
  skipped_duplicate_count: number;
  skipped_invalid_count: number;
  enrichment_failed_count?: number;
}

export interface GoodreadsImportMappedRow {
  row_number: number;
  reading_record: {
    status: ReadingStatus;
    finished_on: string | null;
  };
}

export interface GoodreadsImportedRowRef {
  row_number: number;
  book_id: string;
}

export interface GoodreadsImportResponse {
  meta: GoodreadsImportMeta;
  mapped_rows?: GoodreadsImportMappedRow[];
  imported?: GoodreadsImportedRowRef[];
}

export type ImportJobStatus =
  | 'queued'
  | 'parsing'
  | 'importing'
  | 'enriching'
  | 'completed'
  | 'failed';

export interface ImportJobAcceptedResponse {
  job_id: string;
  status: ImportJobStatus;
  phase: ImportJobStatus;
}

export interface ImportJobStatusResponse {
  job_id: string;
  status: ImportJobStatus;
  phase: ImportJobStatus;
  processed_count: number;
  total_count: number;
  result: GoodreadsImportResponse | null;
  error_message: string | null;
}
