import { InstrEntity, InstrParams } from "./entity";

export interface InstrPort {
  findAll(params: InstrParams): Promise<{ data: InstrEntity[]; total: number }>;
  findById(id: number): Promise<InstrEntity | null>;
  create(data: InstrEntity): Promise<InstrEntity | null>;
  update(id: number, data: InstrEntity): Promise<InstrEntity | null>;
  delete(id: number): Promise<InstrEntity | null>;
}

export const INSTR_REPOSITORY = Symbol('INSTR_REPOSITORY');

