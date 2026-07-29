/**
 * PurchaseProcessRepositoryPort — domain-side interface for PurchaseProcess
 * persistence. Defined in domain so the AutoAttachService can depend on the
 * abstraction, not on Prisma.
 */
export interface ActiveProcessResult {
  id: string;
  propertyPrice: number | null;
  sourceListingId: string | null;
}

export interface CreateProcessInput {
  userId: string;
  propertyPrice: number | null;
}

export interface CreateProcessResult {
  id: string;
  propertyPrice: number | null;
}

export interface PurchaseProcessRepositoryPort {
  findActiveByUserId(userId: string): Promise<ActiveProcessResult | null>;
  create(input: CreateProcessInput): Promise<CreateProcessResult>;
  updatePropertyPrice(processId: string, price: number): Promise<void>;
  setSourceIfMissing(processId: string, listingId: string): Promise<void>;
}
