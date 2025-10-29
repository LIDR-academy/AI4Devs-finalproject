import type { MatchDto } from '../../../types/api';
import type { MatchSortStrategy } from '../interfaces/MatchFilterStrategy';

/**
 * Concrete strategy for sorting by available seats
 * Follows Single Responsibility Principle - only handles seats sorting
 */
export class SeatsSortStrategy implements MatchSortStrategy {
  constructor(private readonly order: 'asc' | 'desc') {}

  sort(matches: MatchDto[]): MatchDto[] {
    return [...matches].sort((a, b) => {
      const comparison = a.seatsFree - b.seatsFree;
      return this.order === 'desc' ? -comparison : comparison;
    });
  }

  getSortName(): string {
    return `Seats ${this.order === 'desc' ? 'Descending' : 'Ascending'}`;
  }
}
