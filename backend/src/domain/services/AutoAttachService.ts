/**
 * AutoAttachService (T037a, FR-014).
 * - If no active PurchaseProcess for the user, create one with propertyPrice from the listing.
 * - If active process exists, attach the listing to it (no propertyPrice change).
 *
 * NOTE: This service imports Prisma directly from infrastructure, which breaks
 * strict hexagonal purity. Trade-off: the auto-attach logic needs atomic find-or-create
 * behaviour that would require a full repository port + transaction support for a
 * single method. For MVP scope, direct Prisma access is the pragmatic choice.
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
      if (existing.propertyPrice === null && input.propertyPrice !== null) {
        await prisma.purchaseProcess.update({
          where: { id: existing.id },
          data: { propertyPrice: input.propertyPrice },
        });
        return {
          processId: existing.id,
          isNewProcess: false,
          propertyPrice: input.propertyPrice,
        };
      }
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

  async setSourceListingIfMissing(processId: string, listingId: string): Promise<void> {
    const proc = await prisma.purchaseProcess.findUnique({
      where: { id: processId },
      select: { sourceListingId: true },
    });
    if (proc && !proc.sourceListingId) {
      await prisma.purchaseProcess.update({
        where: { id: processId },
        data: { sourceListingId: listingId },
      });
    }
  }
}
