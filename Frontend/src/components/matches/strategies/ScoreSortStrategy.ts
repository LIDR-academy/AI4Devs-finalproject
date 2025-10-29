import type { MatchDto } from '../../../types/api';
import type { MatchSortStrategy } from '../interfaces/MatchFilterStrategy';

/**
 * Concrete strategy for sorting by score
 * Follows Single Responsibility Principle - only handles score sorting
 */
export class ScoreSortStrategy implements MatchSortStrategy {
  constructor(private readonly order: 'asc' | 'desc') {}

  sort(matches: MatchDto[]): MatchDto[] {
    return [...matches].sort((a, b) => {
      const comparison = a.score - b.score;
      return this.order === 'desc' ? -comparison : comparison;
    });
  }

  getSortName(): string {
    return `Score ${this.order === 'desc' ? 'Descending' : 'Ascending'}`;
  }
}
