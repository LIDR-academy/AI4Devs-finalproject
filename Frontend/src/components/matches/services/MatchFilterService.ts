import type { MatchDto } from '../../../types/api';
import type { MatchFilterStrategy, MatchSortStrategy } from '../interfaces/MatchFilterStrategy';
import type { FilterStrategyFactory, SortStrategyFactory } from '../interfaces/MatchFilterStrategy';

/**
 * Service for filtering and sorting matches
 * Follows Single Responsibility Principle - only handles match processing
 * Uses Chain of Responsibility pattern for filters
 * Uses Strategy pattern for sorting
 */
export class MatchFilterService {
  constructor(
    private readonly filterFactory: FilterStrategyFactory,
    private readonly sortFactory: SortStrategyFactory
  ) {}

  /**
   * Applies filters and sorting to matches
   * Follows Open/Closed Principle - can be extended with new filters/sorts
   */
  processMatches(
    matches: MatchDto[],
    filters: {
      minScore: number;
      minSeats: number;
      dateFrom?: string;
      dateTo?: string;
      sortBy: 'score' | 'date' | 'seats';
      sortOrder: 'asc' | 'desc';
    }
  ): MatchDto[] {
    // Apply filters using Chain of Responsibility pattern
    let filteredMatches = matches;

    if (filters.minScore > 0) {
      const scoreFilter = this.filterFactory.createScoreFilter(filters.minScore);
      filteredMatches = scoreFilter.filter(filteredMatches);
    }

    if (filters.minSeats > 1) {
      const seatsFilter = this.filterFactory.createSeatsFilter(filters.minSeats);
      filteredMatches = seatsFilter.filter(filteredMatches);
    }

    if (filters.dateFrom || filters.dateTo) {
      const dateFilter = this.filterFactory.createDateRangeFilter(filters.dateFrom, filters.dateTo);
      filteredMatches = dateFilter.filter(filteredMatches);
    }

    // Apply sorting using Strategy pattern
    const sortStrategy = this.createSortStrategy(filters.sortBy, filters.sortOrder);
    return sortStrategy.sort(filteredMatches);
  }

  /**
   * Creates appropriate sort strategy based on criteria
   * Follows Strategy pattern
   */
  private createSortStrategy(sortBy: 'score' | 'date' | 'seats', order: 'asc' | 'desc'): MatchSortStrategy {
    switch (sortBy) {
      case 'score':
        return this.sortFactory.createScoreSort(order);
      case 'date':
        return this.sortFactory.createDateSort(order);
      case 'seats':
        return this.sortFactory.createSeatsSort(order);
      default:
        return this.sortFactory.createScoreSort(order);
    }
  }

  /**
   * Gets active filter names for display
   * Follows Interface Segregation Principle - only exposes what's needed
   */
  getActiveFilterNames(filters: {
    minScore: number;
    minSeats: number;
    dateFrom?: string;
    dateTo?: string;
  }): string[] {
    const names: string[] = [];

    if (filters.minScore > 0) {
      const scoreFilter = this.filterFactory.createScoreFilter(filters.minScore);
      names.push(scoreFilter.getFilterName());
    }

    if (filters.minSeats > 1) {
      const seatsFilter = this.filterFactory.createSeatsFilter(filters.minSeats);
      names.push(seatsFilter.getFilterName());
    }

    if (filters.dateFrom || filters.dateTo) {
      const dateFilter = this.filterFactory.createDateRangeFilter(filters.dateFrom, filters.dateTo);
      const filterName = dateFilter.getFilterName();
      if (filterName) {
        names.push(filterName);
      }
    }

    return names;
  }
}
