import { SexosEntity, SexosParams } from "./entity";

export interface SexosPort {
  findAll(params: SexosParams): Promise<{ data: SexosEntity[]; total: number }>;
  findById(id: number): Promise<SexosEntity | null>;
  create(data: SexosEntity): Promise<SexosEntity | null>;
  update(id: number, data: SexosEntity): Promise<SexosEntity | null>;
  delete(id: number): Promise<SexosEntity | null>;
}

export const SEXOS_REPOSITORY = Symbol('SEXOS_REPOSITORY');

