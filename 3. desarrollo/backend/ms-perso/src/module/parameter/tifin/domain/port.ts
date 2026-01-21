import { TifinEntity, TifinParams } from "./entity";

export interface TifinPort {
  findAll(params: TifinParams): Promise<{ data: TifinEntity[]; total: number }>;
  findById(id: number): Promise<TifinEntity | null>;
  create(data: TifinEntity): Promise<TifinEntity | null>;
  update(id: number, data: TifinEntity): Promise<TifinEntity | null>;
  delete(id: number): Promise<TifinEntity | null>;
}

export const TIFIN_REPOSITORY = Symbol('TIFIN_REPOSITORY');

