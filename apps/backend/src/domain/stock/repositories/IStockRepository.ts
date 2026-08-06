import { Insumo } from '../entities/Insumo.js';
import { Remanente } from '../entities/Remanente.js';

export interface StockMovementRecord {
  id: string;
  insumoId: string;
  type: string;
  quantity: string;
  fromLoc: string;
  toLoc: string;
}

export interface IStockRepository {
  findInsumoById(id: string): Promise<Insumo | null>;
  findRemanenteById(id: string): Promise<Remanente | null>;
  saveInsumo(insumo: Insumo): Promise<void>;
  saveRemanente(remanente: Remanente): Promise<void>;
  recordMovement(movement: StockMovementRecord): Promise<void>;
}
