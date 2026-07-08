/**
 * RedFlag aggregate (FR-028). Normalized to its own table.
 */
import type { RedFlagType, RedFlagSeverity } from '../value-objects/RedFlags';

export class RedFlag {
  private constructor(
    public readonly id: string,
    public readonly analyzedListingId: string,
    public readonly flag: RedFlagType,
    public readonly severity: RedFlagSeverity,
    public readonly reasoning: string,
    public readonly createdAt: Date,
  ) {}

  static fromPrisma(row: {
    id: string;
    analyzedListingId: string;
    flag: string;
    severity: string;
    reasoning: string;
    createdAt: Date;
  }): RedFlag {
    return new RedFlag(
      row.id,
      row.analyzedListingId,
      row.flag as RedFlagType,
      row.severity as RedFlagSeverity,
      row.reasoning,
      row.createdAt,
    );
  }
}
