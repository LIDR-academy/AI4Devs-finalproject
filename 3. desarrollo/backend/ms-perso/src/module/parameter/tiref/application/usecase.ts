import { TirefEntity, TirefParams } from "../domain/entity";
import { TirefPort } from "../domain/port";
import { TirefValue } from "../domain/value";

export class TirefUseCase implements TirefPort {
  constructor(private readonly repository: TirefPort) { }

  public async findAll(params: TirefParams): Promise<{ data: TirefEntity[]; total: number; }> {
    try {
      const listed = await this.repository.findAll(params);
      return listed;
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<TirefEntity | null> {
    try {
      const geted = await this.repository.findById(id);
      return geted;
    } catch (error) {
      throw error;
    }
  }

  public async create(data: TirefEntity): Promise<TirefEntity | null> {
    try {
      const value = new TirefValue(data).toJson();
      const created = await this.repository.create(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: number, data: TirefEntity): Promise<TirefEntity | null> {
    try {
      await this.findById(id);
      const value = new TirefValue(data);
      const updated = await this.repository.update(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<TirefEntity | null> {
    try {
      await this.findById(id);
      const deleted = await this.repository.delete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

