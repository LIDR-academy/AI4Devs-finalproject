import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import {
  IStockRepository,
  StockMovementRecord,
} from '../../../domain/stock/repositories/IStockRepository.js';

export class InMemoryStockRepository implements IStockRepository {
  public insumos: Map<string, Insumo> = new Map();
  public remanentes: Map<string, Remanente> = new Map();
  public movements: StockMovementRecord[] = [];

  async findInsumoById(id: string): Promise<Insumo | null> {
    return this.insumos.get(id) || null;
  }

  async findRemanenteById(id: string): Promise<Remanente | null> {
    return this.remanentes.get(id) || null;
  }

  async findActiveRemanentesByInsumoId(insumoId: string): Promise<Remanente[]> {
    return Array.from(this.remanentes.values())
      .filter((r) => r.insumoId === insumoId && r.status === 'ACTIVE')
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
  }

  async saveInsumo(insumo: Insumo): Promise<void> {
    this.insumos.set(insumo.id, insumo);
  }

  async saveRemanente(remanente: Remanente): Promise<void> {
    this.remanentes.set(remanente.id, remanente);
  }

  public seedInsumo(insumo: Insumo): void {
    this.insumos.set(insumo.id, insumo);
  }

  public seedRemanente(remanente: Remanente): void {
    this.remanentes.set(remanente.id, remanente);
  }

  async recordMovement(movement: StockMovementRecord): Promise<void> {
    this.movements.push({ ...movement, createdAt: movement.createdAt ?? new Date() });
  }
}
