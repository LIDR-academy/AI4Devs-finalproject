export interface StockMovementHistoryItem {
  id: string;
  insumoId: string;
  insumoName: string;
  type: string;
  quantity: string;
  fromLoc: string;
  /** AUDIT-DEV-006 F-7 / TK-101: id del sub-sector de origen (FK, `null` en históricos/cocina). */
  fromStorageLocationId?: string | null;
  toLoc: string;
  operatorId?: string | null;
  purpose?: string | null;
  reason?: string | null;
  recipeId?: string | null;
  createdAt: Date;
}

export interface StockMovementQueryFilters {
  insumoId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IStockMovementQueryRepository {
  findMovements(filters?: StockMovementQueryFilters): Promise<StockMovementHistoryItem[]>;
}
