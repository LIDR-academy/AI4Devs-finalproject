import type { StatsInsightDto } from './stats-insight.dto';

export interface GenreCountDto {
  genre: string;
  count: number;
}

export interface FormatCountDto {
  format: string;
  count: number;
}

export interface AudienceCountDto {
  audience: string;
  count: number;
}

export interface RatingCountDto {
  rating: number;
  count: number;
}

export interface MonthBucketDto {
  month: number;
  books_read: number;
  pages_read: number;
}

export interface YearBucketDto {
  year: number;
  books_read: number;
  pages_read: number;
}

export interface PeriodBookSummaryDto {
  id: string;
  title: string;
  authors: string;
  cover_image_url: string | null;
  finished_on: string;
}

export interface MonthlyStatsResponseDto {
  year: number;
  month: number;
  books_read: number;
  pages_read: number;
  average_rating: number | null;
  genre_distribution: GenreCountDto[];
  format_distribution: FormatCountDto[];
  predominant_format: string | null;
  audience_distribution: AudienceCountDto[];
  rating_distribution: RatingCountDto[];
  monthly_breakdown: MonthBucketDto[];
  books_in_period: PeriodBookSummaryDto[];
  insights: StatsInsightDto[];
}
