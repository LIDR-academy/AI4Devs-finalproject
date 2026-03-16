import { NacioEntity, NacioParams } from "./entity";

export interface NacioPort {
  findAll(params: NacioParams): Promise<{ data: NacioEntity[]; total: number }>;
  findById(id: number): Promise<NacioEntity | null>;
  create(data: NacioEntity): Promise<NacioEntity | null>;
  update(id: number, data: NacioEntity): Promise<NacioEntity | null>;
  delete(id: number): Promise<NacioEntity | null>;
}

export const NACIO_REPOSITORY = Symbol('NACIO_REPOSITORY');

