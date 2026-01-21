import { TrepEntity, TrepParams } from "./entity";

export interface TrepPort {
  findAll(params: TrepParams): Promise<{ data: TrepEntity[]; total: number }>;
  findById(id: number): Promise<TrepEntity | null>;
  create(data: TrepEntity): Promise<TrepEntity | null>;
  update(id: number, data: TrepEntity): Promise<TrepEntity | null>;
  delete(id: number): Promise<TrepEntity | null>;
}

export const TREP_REPOSITORY = Symbol('TREP_REPOSITORY');

