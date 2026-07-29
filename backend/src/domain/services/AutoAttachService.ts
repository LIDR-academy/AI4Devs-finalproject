/**
 * AutoAttachService (T037a, FR-014).
 * - If no active PurchaseProcess for the user, create one with propertyPrice from the listing.
 * - If active process exists, attach the listing to it (no propertyPrice change).
 */
import type { PurchaseProcessRepositoryPort } from '../ports/PurchaseProcessRepositoryPort';

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
  constructor(private readonly repo: PurchaseProcessRepositoryPort) {}

  async attach(input: AutoAttachInput): Promise<AutoAttachResult> {
    const existing = await this.repo.findActiveByUserId(input.userId);

    if (existing) {
      const price = input.propertyPrice ?? existing.propertyPrice;
      if (input.propertyPrice !== null && input.propertyPrice !== existing.propertyPrice) {
        await this.repo.updatePropertyPrice(existing.id, input.propertyPrice);
      }
      return {
        processId: existing.id,
        isNewProcess: false,
        propertyPrice: price,
      };
    }

    const created = await this.repo.create({
      userId: input.userId,
      propertyPrice: input.propertyPrice,
    });

    return {
      processId: created.id,
      isNewProcess: true,
      propertyPrice: created.propertyPrice,
    };
  }

  async setSourceListingIfMissing(processId: string, listingId: string): Promise<void> {
    await this.repo.setSourceIfMissing(processId, listingId);
  }
}
