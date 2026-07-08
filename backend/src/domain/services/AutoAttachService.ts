/**
 * AutoAttachService (T037a, FR-014).
 * - If no active PurchaseProcess for the user, create one with propertyPrice from the listing.
 * - If active process exists, attach the listing to it (no propertyPrice change).
 */
import { prisma } from '../../infrastructure/prisma/client';

export interface AutoAttachInput {
  userId: string;
  listingUrl: string;
  propertyPrice: number | null;
}

export interface AutoAttachResult {
  processId: string;
  isNewProcess: boolean;
  propertyPrice: number | null;
}

export class AutoAttachService {
  async attach(input: AutoAttachInput): Promise<AutoAttachResult> {
    const existing = await prisma.purchaseProcess.findFirst({
      where: { userId: input.userId, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      return {
        processId: existing.id,
        isNewProcess: false,
        propertyPrice: existing.propertyPrice ? Number(existing.propertyPrice) : null,
      };
    }

    const created = await prisma.purchaseProcess.create({
      data: {
        userId: input.userId,
        status: 'ACTIVE',
        currentStage: 'PRE_ARRAS',
        propertyPrice: input.propertyPrice,
        sourceListingId: null,
      },
    });

    return {
      processId: created.id,
      isNewProcess: true,
      propertyPrice: created.propertyPrice ? Number(created.propertyPrice) : null,
    };
  }
}
