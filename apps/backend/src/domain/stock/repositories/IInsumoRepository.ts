import { Insumo } from '../entities/Insumo.js';

export interface IInsumoRepository {
  findById(id: string): Promise<Insumo | null>;
  findByName(name: string): Promise<Insumo | null>;
  findAll(): Promise<Insumo[]>;
  save(insumo: Insumo): Promise<void>;
}
