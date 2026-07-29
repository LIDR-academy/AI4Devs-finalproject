export type StatsInsightKind =
  | 'volume_delta'
  | 'genre_trend'
  | 'format_mix'
  | 'pages_milestone'
  | 'rating_pattern'
  | 'other';

export interface StatsInsightDto {
  id: string;
  kind: StatsInsightKind;
  title: string;
  body: string;
  data?: Record<string, string | number | boolean | null>;
}
