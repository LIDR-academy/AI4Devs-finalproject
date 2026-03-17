import type { MatchDto } from '../../../types/api';
import type { MatchFilterStrategy } from '../interfaces/MatchFilterStrategy';

/**
 * Concrete strategy for filtering by date range
 * Follows Single Responsibility Principle - only handles date filtering
 */
export class DateRangeFilterStrategy implements MatchFilterStrategy {
  constructor(
    private readonly fromDate?: string,
    private readonly toDate?: string
  ) {}

  filter(matches: MatchDto[]): MatchDto[] {
    return matches.filter(match => {
      const matchDate = new Date(match.dateTime);
      
      if (this.fromDate) {
        const fromDate = new Date(this.fromDate);
        if (matchDate < fromDate) return false;
      }
      
      if (this.toDate) {
        const toDate = new Date(this.toDate);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (matchDate > toDate) return false;
      }
      
      return true;
    });
  }

  getFilterName(): string {
    const parts: string[] = [];
    if (this.fromDate) parts.push(`From ${new Date(this.fromDate).toLocaleDateString()}`);
    if (this.toDate) parts.push(`To ${new Date(this.toDate).toLocaleDateString()}`);
    return parts.join(', ');
  }
}
