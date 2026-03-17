import type { MatchDto } from '../../../types/api';
import type { MatchFilterStrategy } from '../interfaces/MatchFilterStrategy';

/**
 * Concrete strategy for filtering by available seats
 * Follows Single Responsibility Principle - only handles seats filtering
 */
export class SeatsFilterStrategy implements MatchFilterStrategy {
  constructor(private readonly minSeats: number) {}

  filter(matches: MatchDto[]): MatchDto[] {
    return matches.filter(match => match.seatsFree >= this.minSeats);
  }

  getFilterName(): string {
    return `Seats ≥ ${this.minSeats}`;
  }
}
