import { RasamEntity, RasamParams } from "./entity";

export interface RasamPort {
  findAll(params: RasamParams): Promise<{ data: RasamEntity[]; total: number }>;
  findById(id: number): Promise<RasamEntity | null>;
  create(data: RasamEntity): Promise<RasamEntity | null>;
  update(id: number, data: RasamEntity): Promise<RasamEntity | null>;
  delete(id: number): Promise<RasamEntity | null>;
}

export const RASAM_REPOSITORY = Symbol('RASAM_REPOSITORY');

