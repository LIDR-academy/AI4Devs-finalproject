import { IfinaEntity, IfinaParams } from "./entity";

export interface IfinaPort {
  findAll(params: IfinaParams): Promise<{ data: IfinaEntity[]; total: number }>;
  findById(id: number): Promise<IfinaEntity | null>;
  create(data: IfinaEntity): Promise<IfinaEntity | null>;
  update(id: number, data: IfinaEntity): Promise<IfinaEntity | null>;
  delete(id: number): Promise<IfinaEntity | null>;
}

export const IFINA_REPOSITORY = Symbol('IFINA_REPOSITORY');

