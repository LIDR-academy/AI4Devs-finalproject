import { EtniaEntity, EtniaParams } from "./entity";

export interface EtniaPort {
  findAll(params: EtniaParams): Promise<{ data: EtniaEntity[]; total: number }>;
  findById(id: number): Promise<EtniaEntity | null>;
  create(data: EtniaEntity): Promise<EtniaEntity | null>;
  update(id: number, data: EtniaEntity): Promise<EtniaEntity | null>;
  delete(id: number): Promise<EtniaEntity | null>;
}

export const ETNIA_REPOSITORY = Symbol('ETNIA_REPOSITORY');

