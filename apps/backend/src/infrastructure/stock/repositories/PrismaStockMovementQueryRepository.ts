import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import {
  IStockMovementQueryRepository,
  StockMovementHistoryItem,
  StockMovementQueryFilters,
} from '../../../domain/stock/repositories/IStockMovementQueryRepository.js';

export class PrismaStockMovementQueryRepository implements IStockMovementQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findMovements(filters?: StockMovementQueryFilters): Promise<StockMovementHistoryItem[]> {
    const where: Prisma.StockMovementWhereInput = {};

    if (filters?.insumoId) {
      where.insumoId = filters.insumoId;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      };
    }

    const list = await this.prisma.stockMovement.findMany({
      where,
      include: { insumo: true },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((movement) => ({
      id: movement.id,
      insumoId: movement.insumoId,
      insumoName: movement.insumo.name,
      type: movement.type,
      quantity: movement.quantity.toString(),
      fromLoc: movement.fromLoc,
      toLoc: movement.toLoc,
      createdAt: movement.createdAt,
    }));
  }
}
