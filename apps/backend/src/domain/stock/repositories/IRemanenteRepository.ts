import { Remanente } from '../entities/Remanente.js';

export interface StockMovementRecord {
  id: string;
  insumoId: string;
  type: string;
  quantity: string;
  fromLoc: string;
  toLoc: string;
  /** AUDIT-DEV-006 F-7 / TK-101: id del sub-sector de bodega de origen (FK). `fromLoc`
   * se conserva como snapshot de display para movimientos sin FK (históricos, cocina). */
  fromStorageLocationId?: string;
  operatorId?: string;
  purpose?: string;
  reason?: string;
  /** ADR-004: motivo estructurado del catálogo `ConsumptionReason` (`CONSUMPTION` / `SHIFT_RECONCILIATION_VARIANCE`). */
  reasonId?: string;
  recipeId?: string;
  // Opcional: Prisma lo genera solo (@default(now())); InMemoryStockRepository lo completa
  // si no viene seteado (TK-050, trazabilidad de movimientos).
  createdAt?: Date;
}

export interface IRemanenteRepository {
  findRemanenteById(id: string): Promise<Remanente | null>;
  findActiveRemanentesByInsumoId(insumoId: string): Promise<Remanente[]>;
  saveRemanente(remanente: Remanente): Promise<void>;
  recordMovement(movement: StockMovementRecord): Promise<void>;
  /**
   * US-026 / Invariante 5: `true` si existe algún `Remanente` `ACTIVE` en el área de
   * cocina indicada. Se comprueba por FK (`storageLocationId`) y, para remanentes
   * históricos sin FK, por el literal `location` == `locationName`.
   */
  existsActiveRemanenteAtLocation(storageLocationId: string, locationName: string): Promise<boolean>;
}
