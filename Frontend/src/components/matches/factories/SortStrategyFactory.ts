import type { MatchSortStrategy, SortStrategyFactory } from '../interfaces/MatchFilterStrategy';
import { ScoreSortStrategy } from '../strategies/ScoreSortStrategy';
import { DateSortStrategy } from '../strategies/DateSortStrategy';
import { SeatsSortStrategy } from '../strategies/SeatsSortStrategy';

/**
 * Factory for creating sort strategies
 * Follows Factory Pattern and Single Responsibility Principle
 */
export class ConcreteSortStrategyFactory implements SortStrategyFactory {
  createScoreSort(order: 'asc' | 'desc'): MatchSortStrategy {
    return new ScoreSortStrategy(order);
  }

  createDateSort(order: 'asc' | 'desc'): MatchSortStrategy {
    return new DateSortStrategy(order);
  }

  createSeatsSort(order: 'asc' | 'desc'): MatchSortStrategy {
    return new SeatsSortStrategy(order);
  }
}
