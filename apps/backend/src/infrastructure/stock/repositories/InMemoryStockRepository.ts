import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { IStockRepository, StockMovementRecord } from '../../../domain/stock/repositories/IStockRepository.js';

export class InMemoryStockRepository implements IStockRepository {
  public insumos: Map<string, Insumo> = new Map();
  public remanentes: Map<string, Remanente> = new Map();
  public movements: StockMovementRecord[] = [];

  public async findInsumoById(id: string): Promise<Insumo | null> {
    const found = this.insumos.get(id);
    return found ? found : null;
  }

  public async findRemanenteById(id: string): Promise<Remanente | null> {
    const found = this.remanentes.get(id);
    return found ? found : null;
  }

  public async saveInsumo(insumo: Insumo): Promise<void> {
    this.insumos.set(insumo.id, insumo);
  }

  public async saveRemanente(remanente: Remanente): Promise<void> {
    this.remanentes.set(remanente.id, remanente);
  }

  public async recordMovement(movement: StockMovementRecord): Promise<void> {
    this.movements.push(movement);
  }

  public seedInsumo(insumo: Insumo): void {
    this.insumos.set(insumo.id, insumo);
  }

  public seedRemanente(remanente: Remanente): void {
    this.remanentes.set(remanente.id, remanente);
  }
}
