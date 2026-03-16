import { TpersEntity, TpersParams } from "./entity";

export interface TpersPort {
  findAll(params: TpersParams): Promise<{ data: TpersEntity[]; total: number }>;
  findById(id: number): Promise<TpersEntity | null>;
  create(data: TpersEntity): Promise<TpersEntity | null>;
  update(id: number, data: TpersEntity): Promise<TpersEntity | null>;
  delete(id: number): Promise<TpersEntity | null>;
}

export const TPERS_REPOSITORY = Symbol('TPERS_REPOSITORY');

