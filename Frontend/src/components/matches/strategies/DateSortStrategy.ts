import type { MatchDto } from '../../../types/api';
import type { MatchSortStrategy } from '../interfaces/MatchFilterStrategy';

/**
 * Concrete strategy for sorting by date
 * Follows Single Responsibility Principle - only handles date sorting
 */
export class DateSortStrategy implements MatchSortStrategy {
  constructor(private readonly order: 'asc' | 'desc') {}

  sort(matches: MatchDto[]): MatchDto[] {
    return [...matches].sort((a, b) => {
      const dateA = new Date(a.dateTime).getTime();
      const dateB = new Date(b.dateTime).getTime();
      const comparison = dateA - dateB;
      return this.order === 'desc' ? -comparison : comparison;
    });
  }

  getSortName(): string {
    return `Date ${this.order === 'desc' ? 'Descending' : 'Ascending'}`;
  }
}
