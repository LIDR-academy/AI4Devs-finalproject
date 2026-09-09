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
      include: { insumo: true, fromStorageLocation: true },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((movement) => ({
      id: movement.id,
      insumoId: movement.insumoId,
      insumoName: movement.insumo.name,
      type: movement.type,
      quantity: movement.quantity.toString(),
      // AUDIT-DEV-006 F-7 / TK-101: si el sub-sector aún existe, se muestra su nombre
      // ACTUAL (join) — renombrar el StorageLocation se refleja en el histórico. El
      // `fromLoc` guardado (snapshot) es el fallback para movimientos sin FK.
      fromLoc: movement.fromStorageLocation?.name ?? movement.fromLoc,
      fromStorageLocationId: movement.fromStorageLocationId,
      toLoc: movement.toLoc,
      operatorId: movement.operatorId,
      purpose: movement.purpose,
      reason: movement.reason,
      recipeId: movement.recipeId,
      createdAt: movement.createdAt,
    }));
  }
}
