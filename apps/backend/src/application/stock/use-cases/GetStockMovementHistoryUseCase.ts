import { IStockMovementQueryRepository } from '../../../domain/stock/repositories/IStockMovementQueryRepository.js';

export interface GetStockMovementHistoryInput {
  insumoId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface StockMovementHistoryResponseDTO {
  id: string;
  insumoId: string;
  insumoName: string;
  type: string;
  quantity: string;
  fromLoc: string;
  /** AUDIT-DEV-006 F-7 / TK-101: id del sub-sector de origen (`undefined` en históricos/cocina). */
  fromStorageLocationId?: string | null;
  toLoc: string;
  createdAt: string;
}

export class GetStockMovementHistoryUseCase {
  constructor(private readonly stockMovementQueryRepository: IStockMovementQueryRepository) {}

  public async execute(input: GetStockMovementHistoryInput): Promise<StockMovementHistoryResponseDTO[]> {
    const movements = await this.stockMovementQueryRepository.findMovements(input);

    return movements.map((movement) => ({
      id: movement.id,
      insumoId: movement.insumoId,
      insumoName: movement.insumoName,
      type: movement.type,
      quantity: movement.quantity,
      fromLoc: movement.fromLoc,
      fromStorageLocationId: movement.fromStorageLocationId,
      toLoc: movement.toLoc,
      createdAt: movement.createdAt.toISOString(),
    }));
  }
}
