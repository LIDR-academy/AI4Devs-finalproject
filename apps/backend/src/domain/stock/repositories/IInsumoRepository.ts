import { Insumo } from '../entities/Insumo.js';

export interface IInsumoRepository {
  findById(id: string): Promise<Insumo | null>;
  findByName(name: string): Promise<Insumo | null>;
  findAll(): Promise<Insumo[]>;
  save(insumo: Insumo): Promise<void>;
  /**
   * US-025: `true` si algún insumo tiene una línea de stock con saldo `> 0` en el
   * sub-sector indicado. Bloquea el borrado/desactivación del sector (Invariante 1-bis).
   */
  existsStockAtLocation(storageLocationId: string): Promise<boolean>;
}
