import type { MatchDto } from '../../../types/api';
import type { MatchFilterStrategy } from '../interfaces/MatchFilterStrategy';

/**
 * Concrete strategy for filtering by score
 * Follows Single Responsibility Principle - only handles score filtering
 */
export class ScoreFilterStrategy implements MatchFilterStrategy {
  constructor(private readonly minScore: number) {}

  filter(matches: MatchDto[]): MatchDto[] {
    return matches.filter(match => match.score >= this.minScore / 100);
  }

  getFilterName(): string {
    return `Score ≥ ${this.minScore}%`;
  }
}
