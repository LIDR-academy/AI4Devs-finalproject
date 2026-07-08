/**
 * PurchaseProcess aggregate. FR-014: at most one ACTIVE per session.
 */
import type { BureaucraticStage } from '../value-objects/BureaucraticMilestone';
import type { FinancialProfile } from '../value-objects/FinancialProfile';

export type ProcessStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

export class PurchaseProcess {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly status: ProcessStatus,
    public readonly currentStage: BureaucraticStage,
    public readonly propertyPrice: number | null,
    public readonly sourceListingId: string | null,
    public readonly financialProfile: FinancialProfile | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPrisma(row: {
    id: string;
    userId: string;
    status: ProcessStatus;
    currentStage: BureaucraticStage;
    propertyPrice: unknown;
    sourceListingId: string | null;
    financialProfile: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): PurchaseProcess {
    return new PurchaseProcess(
      row.id,
      row.userId,
      row.status,
      row.currentStage,
      row.propertyPrice ? Number(row.propertyPrice) : null,
      row.sourceListingId,
      null,
      row.createdAt,
      row.updatedAt,
    );
  }
}
