import { TcontEntity, TcontParams } from "../domain/entity";
import { TcontPort } from "../domain/port";
import { TcontValue } from "../domain/value";

export class TcontUseCase implements TcontPort {
  constructor(private readonly repository: TcontPort) { }

  public async findAll(params: TcontParams): Promise<{ data: TcontEntity[]; total: number; }> {
    try {
      const listed = await this.repository.findAll(params);
      return listed;
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<TcontEntity | null> {
    try {
      const geted = await this.repository.findById(id);
      return geted;
    } catch (error) {
      throw error;
    }
  }

  public async create(data: TcontEntity): Promise<TcontEntity | null> {
    try {
      const value = new TcontValue(data).toJson();
      const created = await this.repository.create(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: number, data: TcontEntity): Promise<TcontEntity | null> {
    try {
      await this.findById(id);
      const value = new TcontValue(data);
      const updated = await this.repository.update(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<TcontEntity | null> {
    try {
      await this.findById(id);
      const deleted = await this.repository.delete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

