import type {
  AudienceCountDto,
  FormatCountDto,
  GenreCountDto,
  PeriodBookSummaryDto,
  RatingCountDto,
  YearBucketDto,
} from './monthly-stats-response.dto';
import type { StatsInsightDto } from './stats-insight.dto';

export interface YearlyStatsResponseDto {
  year: number;
  books_read: number;
  pages_read: number;
  average_rating: number | null;
  genre_distribution: GenreCountDto[];
  format_distribution: FormatCountDto[];
  predominant_format: string | null;
  audience_distribution: AudienceCountDto[];
  rating_distribution: RatingCountDto[];
  yearly_breakdown: YearBucketDto[];
  books_in_period: PeriodBookSummaryDto[];
  insights: StatsInsightDto[];
}
