import {
  IStockMovementQueryRepository,
  StockMovementHistoryItem,
  StockMovementQueryFilters,
} from '../../../domain/stock/repositories/IStockMovementQueryRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { InMemoryStockRepository } from './InMemoryStockRepository.js';

export class InMemoryStockMovementQueryRepository implements IStockMovementQueryRepository {
  constructor(
    private readonly stockRepo?: InMemoryStockRepository,
    // AUDIT-DEV-006 F-7 / TK-101: mismo join-preference que PrismaStockMovementQueryRepository.
    private readonly locationRepository?: IStorageLocationRepository
  ) {}

  public async findMovements(filters?: StockMovementQueryFilters): Promise<StockMovementHistoryItem[]> {
    if (!this.stockRepo) {
      return [];
    }

    let items: StockMovementHistoryItem[] = await Promise.all(
      this.stockRepo.movements.map(async (movement) => ({
        id: movement.id,
        insumoId: movement.insumoId,
        insumoName: this.stockRepo!.insumos.get(movement.insumoId)?.name ?? movement.insumoId,
        type: movement.type,
        quantity: movement.quantity,
        // AUDIT-DEV-006 F-7 / TK-101: si el sub-sector aún existe, se muestra su nombre
        // ACTUAL (join) — renombrarlo se refleja en el histórico. Fallback al snapshot
        // guardado (`fromLoc`) para movimientos sin FK.
        fromLoc: (await this.resolveCurrentSectorName(movement.fromStorageLocationId)) ?? movement.fromLoc,
        fromStorageLocationId: movement.fromStorageLocationId,
        toLoc: movement.toLoc,
        operatorId: movement.operatorId,
        purpose: movement.purpose,
        reason: movement.reason,
        recipeId: movement.recipeId,
        createdAt: movement.createdAt ?? new Date(),
      }))
    );

    if (filters?.insumoId) {
      items = items.filter((item) => item.insumoId === filters.insumoId);
    }
    if (filters?.startDate) {
      items = items.filter((item) => item.createdAt >= filters.startDate!);
    }
    if (filters?.endDate) {
      items = items.filter((item) => item.createdAt <= filters.endDate!);
    }

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private async resolveCurrentSectorName(storageLocationId?: string): Promise<string | undefined> {
    if (!storageLocationId || !this.locationRepository) return undefined;
    const location = await this.locationRepository.findLocationById(storageLocationId);
    return location?.name;
  }
}
