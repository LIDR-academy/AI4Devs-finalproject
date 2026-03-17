import type { MatchFilterStrategy, FilterStrategyFactory } from '../interfaces/MatchFilterStrategy';
import { ScoreFilterStrategy } from '../strategies/ScoreFilterStrategy';
import { SeatsFilterStrategy } from '../strategies/SeatsFilterStrategy';
import { DateRangeFilterStrategy } from '../strategies/DateRangeFilterStrategy';

/**
 * Factory for creating filter strategies
 * Follows Factory Pattern and Single Responsibility Principle
 */
export class ConcreteFilterStrategyFactory implements FilterStrategyFactory {
  createScoreFilter(minScore: number): MatchFilterStrategy {
    return new ScoreFilterStrategy(minScore);
  }

  createSeatsFilter(minSeats: number): MatchFilterStrategy {
    return new SeatsFilterStrategy(minSeats);
  }

  createDateRangeFilter(fromDate?: string, toDate?: string): MatchFilterStrategy {
    return new DateRangeFilterStrategy(fromDate, toDate);
  }
}
