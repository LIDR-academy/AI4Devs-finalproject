import { Insumo } from '../entities/Insumo.js';
import { Remanente } from '../entities/Remanente.js';

export interface StockMovementRecord {
  id: string;
  insumoId: string;
  type: string;
  quantity: string;
  fromLoc: string;
  toLoc: string;
  // Opcional: Prisma lo genera solo (@default(now())); InMemoryStockRepository lo completa
  // si no viene seteado (TK-050, trazabilidad de movimientos).
  createdAt?: Date;
}

export interface IStockRepository {
  findInsumoById(id: string): Promise<Insumo | null>;
  findRemanenteById(id: string): Promise<Remanente | null>;
  findActiveRemanentesByInsumoId(insumoId: string): Promise<Remanente[]>;
  saveInsumo(insumo: Insumo): Promise<void>;
  saveRemanente(remanente: Remanente): Promise<void>;
  recordMovement(movement: StockMovementRecord): Promise<void>;
}
