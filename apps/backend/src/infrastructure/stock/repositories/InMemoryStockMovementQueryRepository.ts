import {
  IStockMovementQueryRepository,
  StockMovementHistoryItem,
  StockMovementQueryFilters,
} from '../../../domain/stock/repositories/IStockMovementQueryRepository.js';
import { InMemoryStockRepository } from './InMemoryStockRepository.js';

export class InMemoryStockMovementQueryRepository implements IStockMovementQueryRepository {
  constructor(private readonly stockRepo?: InMemoryStockRepository) {}

  public async findMovements(filters?: StockMovementQueryFilters): Promise<StockMovementHistoryItem[]> {
    if (!this.stockRepo) {
      return [];
    }

    let items: StockMovementHistoryItem[] = this.stockRepo.movements.map((movement) => ({
      id: movement.id,
      insumoId: movement.insumoId,
      insumoName: this.stockRepo!.insumos.get(movement.insumoId)?.name ?? movement.insumoId,
      type: movement.type,
      quantity: movement.quantity,
      fromLoc: movement.fromLoc,
      toLoc: movement.toLoc,
      operatorId: movement.operatorId,
      purpose: movement.purpose,
      reason: movement.reason,
      recipeId: movement.recipeId,
      createdAt: movement.createdAt ?? new Date(),
    }));

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
}
