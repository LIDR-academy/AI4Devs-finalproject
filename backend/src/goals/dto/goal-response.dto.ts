export type GoalForecastStatus = 'ahead' | 'on_track' | 'behind';

export interface GoalForecastDto {
  projected_year_end_count: number;
  on_track: boolean;
  pace_books_per_week: number;
  required_books_per_week: number;
  status: GoalForecastStatus;
}

export interface GoalResourceDto {
  id: string;
  target_book_count: number;
  created_at: string;
  updated_at: string;
}

export interface AnnualGoalResponseDto {
  year: number;
  goal: GoalResourceDto | null;
  books_read: number;
  progress_percent: number | null;
  forecast: GoalForecastDto | null;
}
