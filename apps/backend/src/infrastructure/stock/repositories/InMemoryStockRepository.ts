import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import {
  IRemanenteRepository,
  StockMovementRecord,
} from '../../../domain/stock/repositories/IRemanenteRepository.js';

export class InMemoryStockRepository implements IInsumoRepository, IRemanenteRepository {
  public insumos: Map<string, Insumo> = new Map();
  public remanentes: Map<string, Remanente> = new Map();
  public movements: StockMovementRecord[] = [];

  async findById(id: string): Promise<Insumo | null> {
    return this.insumos.get(id) || null;
  }

  async findInsumoById(id: string): Promise<Insumo | null> {
    return this.findById(id);
  }

  async findByName(name: string): Promise<Insumo | null> {
    const target = name.trim().toLowerCase();
    for (const insumo of this.insumos.values()) {
      if (insumo.name.trim().toLowerCase() === target) {
        return insumo;
      }
    }
    return null;
  }

  async findAll(): Promise<Insumo[]> {
    return Array.from(this.insumos.values());
  }

  async findRemanenteById(id: string): Promise<Remanente | null> {
    return this.remanentes.get(id) || null;
  }

  async findActiveRemanentesByInsumoId(insumoId: string): Promise<Remanente[]> {
    return Array.from(this.remanentes.values())
      .filter((r) => r.insumoId === insumoId && r.status === 'ACTIVE')
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
  }

  async save(insumo: Insumo): Promise<void> {
    this.insumos.set(insumo.id, insumo);
  }

  async existsStockAtLocation(storageLocationId: string): Promise<boolean> {
    for (const insumo of this.insumos.values()) {
      const line = insumo.stockLines.find((l) => l.storageLocationId === storageLocationId);
      if (line && !line.quantity.toDecimal().isZero()) {
        return true;
      }
    }
    return false;
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
