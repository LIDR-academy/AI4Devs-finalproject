import { TrepEntity, TrepParams } from "../domain/entity";
import { TrepPort } from "../domain/port";
import { TrepValue } from "../domain/value";

export class TrepUseCase implements TrepPort {
  constructor(private readonly repository: TrepPort) { }

  public async findAll(params: TrepParams): Promise<{ data: TrepEntity[]; total: number; }> {
    try {
      const listed = await this.repository.findAll(params);
      return listed;
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<TrepEntity | null> {
    try {
      const geted = await this.repository.findById(id);
      return geted;
    } catch (error) {
      throw error;
    }
  }

  public async create(data: TrepEntity): Promise<TrepEntity | null> {
    try {
      const value = new TrepValue(data).toJson();
      const created = await this.repository.create(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: number, data: TrepEntity): Promise<TrepEntity | null> {
    try {
      await this.findById(id);
      const value = new TrepValue(data);
      const updated = await this.repository.update(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<TrepEntity | null> {
    try {
      await this.findById(id);
      const deleted = await this.repository.delete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

