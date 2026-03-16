import { TcontEntity, TcontParams } from "./entity";

export interface TcontPort {
  findAll(params: TcontParams): Promise<{ data: TcontEntity[]; total: number }>;
  findById(id: number): Promise<TcontEntity | null>;
  create(data: TcontEntity): Promise<TcontEntity | null>;
  update(id: number, data: TcontEntity): Promise<TcontEntity | null>;
  delete(id: number): Promise<TcontEntity | null>;
}

export const TCONT_REPOSITORY = Symbol('TCONT_REPOSITORY');

