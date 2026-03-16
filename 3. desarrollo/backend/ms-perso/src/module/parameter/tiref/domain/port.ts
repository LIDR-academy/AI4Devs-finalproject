import { TirefEntity, TirefParams } from "./entity";

export interface TirefPort {
  findAll(params: TirefParams): Promise<{ data: TirefEntity[]; total: number }>;
  findById(id: number): Promise<TirefEntity | null>;
  create(data: TirefEntity): Promise<TirefEntity | null>;
  update(id: number, data: TirefEntity): Promise<TirefEntity | null>;
  delete(id: number): Promise<TirefEntity | null>;
}

export const TIREF_REPOSITORY = Symbol('TIREF_REPOSITORY');

