import { EciviEntity, EciviParams } from "../domain/entity";
import { EciviPort } from "../domain/port";
import { EciviValue } from "../domain/value";

export class EciviUseCase implements EciviPort {
  constructor(private readonly repository: EciviPort) { }

  public async findAll(params: EciviParams): Promise<{ data: EciviEntity[]; total: number; }> {
    try {
      const listed = await this.repository.findAll(params);
      return listed;
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<EciviEntity | null> {
    try {
      const geted = await this.repository.findById(id);
      return geted;
    } catch (error) {
      throw error;
    }
  }

  public async create(data: EciviEntity): Promise<EciviEntity | null> {
    try {
      const value = new EciviValue(data).toJson();
      const created = await this.repository.create(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: number, data: EciviEntity): Promise<EciviEntity | null> {
    try {
      await this.findById(id);
      const value = new EciviValue(data);
      const updated = await this.repository.update(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<EciviEntity | null> {
    try {
      await this.findById(id);
      const deleted = await this.repository.delete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

