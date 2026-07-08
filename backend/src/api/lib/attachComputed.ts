/**
 * Build the ComputedMortgage for a Prisma PurchaseProcess row.
 * Centralizes the pattern used by GET /api/purchase-processes/:id
 * and GET /api/dashboard.
 */
import type { PurchaseProcess } from '@prisma/client';
import { PurchaseProcessAggregator } from '../../domain/services/PurchaseProcessAggregator';
import { FinancialProfile } from '../../domain/value-objects/FinancialProfile';
import type { ComputedMortgage } from '../../domain/services/PurchaseProcessAggregator';

const aggregator = new PurchaseProcessAggregator();

export function buildComputedFor(
  process: Pick<PurchaseProcess, 'propertyPrice' | 'financialProfile'>,
): ComputedMortgage | null {
  const profile = process.financialProfile
    ? FinancialProfile.fromPrisma(process.financialProfile)
    : null;
  return aggregator.compute(
    process.propertyPrice ? Number(process.propertyPrice) : null,
    profile,
  );
}
