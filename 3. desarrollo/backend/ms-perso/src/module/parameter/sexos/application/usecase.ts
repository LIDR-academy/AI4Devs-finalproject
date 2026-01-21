import { SexosEntity, SexosParams } from "../domain/entity";
import { SexosPort } from "../domain/port";
import { SexosValue } from "../domain/value";

export class SexosUseCase implements SexosPort {
  constructor(private readonly repository: SexosPort) { }

  public async findAll(params: SexosParams): Promise<{ data: SexosEntity[]; total: number; }> {
    try {
      const listed = await this.repository.findAll(params);
      return listed;
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<SexosEntity | null> {
    try {
      const geted = await this.repository.findById(id);
      return geted;
    } catch (error) {
      throw error;
    }
  }

  public async create(data: SexosEntity): Promise<SexosEntity | null> {
    try {
      const value = new SexosValue(data).toJson();
      const created = await this.repository.create(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: number, data: SexosEntity): Promise<SexosEntity | null> {
    try {
      await this.findById(id);
      const value = new SexosValue(data);
      const updated = await this.repository.update(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<SexosEntity | null> {
    try {
      await this.findById(id);
      const deleted = await this.repository.delete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

