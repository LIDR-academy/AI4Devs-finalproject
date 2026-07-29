import { PrismaClient } from '@prisma/client';
import type {
  PurchaseProcessRepositoryPort,
  ActiveProcessResult,
  CreateProcessInput,
  CreateProcessResult,
} from '../../domain/ports/PurchaseProcessRepositoryPort';

export class PurchaseProcessRepository implements PurchaseProcessRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findActiveByUserId(userId: string): Promise<ActiveProcessResult | null> {
    const row = await this.prisma.purchaseProcess.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, propertyPrice: true, sourceListingId: true },
    });
    if (!row) return null;
    return {
      id: row.id,
      propertyPrice: row.propertyPrice ? Number(row.propertyPrice) : null,
      sourceListingId: row.sourceListingId,
    };
  }

  async create(input: CreateProcessInput): Promise<CreateProcessResult> {
    const row = await this.prisma.purchaseProcess.create({
      data: {
        userId: input.userId,
        status: 'ACTIVE',
        currentStage: 'PRE_ARRAS',
        propertyPrice: input.propertyPrice,
        sourceListingId: null,
      },
    });
    return {
      id: row.id,
      propertyPrice: row.propertyPrice ? Number(row.propertyPrice) : null,
    };
  }

  async updatePropertyPrice(processId: string, price: number): Promise<void> {
    await this.prisma.purchaseProcess.update({
      where: { id: processId },
      data: { propertyPrice: price },
    });
  }

  async setSourceIfMissing(processId: string, listingId: string): Promise<void> {
    const proc = await this.prisma.purchaseProcess.findUnique({
      where: { id: processId },
      select: { sourceListingId: true },
    });
    if (proc && !proc.sourceListingId) {
      await this.prisma.purchaseProcess.update({
        where: { id: processId },
        data: { sourceListingId: listingId },
      });
    }
  }
}
