import type { MatchDto } from '../../../types/api';

/**
 * Strategy pattern for filtering matches
 * Follows Open/Closed Principle - open for extension, closed for modification
 */
export interface MatchFilterStrategy {
  filter(matches: MatchDto[]): MatchDto[];
  getFilterName(): string;
}

/**
 * Strategy pattern for sorting matches
 */
export interface MatchSortStrategy {
  sort(matches: MatchDto[]): MatchDto[];
  getSortName(): string;
}

/**
 * Factory pattern for creating filter strategies
 */
export interface FilterStrategyFactory {
  createScoreFilter(minScore: number): MatchFilterStrategy;
  createSeatsFilter(minSeats: number): MatchFilterStrategy;
  createDateRangeFilter(fromDate?: string, toDate?: string): MatchFilterStrategy;
}

/**
 * Factory pattern for creating sort strategies
 */
export interface SortStrategyFactory {
  createScoreSort(order: 'asc' | 'desc'): MatchSortStrategy;
  createDateSort(order: 'asc' | 'desc'): MatchSortStrategy;
  createSeatsSort(order: 'asc' | 'desc'): MatchSortStrategy;
}
