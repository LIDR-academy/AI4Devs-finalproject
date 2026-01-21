import { EciviEntity, EciviParams } from "./entity";

export interface EciviPort {
  findAll(params: EciviParams): Promise<{ data: EciviEntity[]; total: number }>;
  findById(id: number): Promise<EciviEntity | null>;
  create(data: EciviEntity): Promise<EciviEntity | null>;
  update(id: number, data: EciviEntity): Promise<EciviEntity | null>;
  delete(id: number): Promise<EciviEntity | null>;
}

export const ECIVI_REPOSITORY = Symbol('ECIVI_REPOSITORY');

