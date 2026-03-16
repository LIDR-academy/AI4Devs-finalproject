import { NacioEntity, NacioParams } from "../domain/entity";
import { NacioPort } from "../domain/port";
import { NacioValue } from "../domain/value";

export class NacioUseCase implements NacioPort {
  constructor(private readonly repository: NacioPort) { }

  public async findAll(params: NacioParams): Promise<{ data: NacioEntity[]; total: number; }> {
    try {
      const listed = await this.repository.findAll(params);
      return listed;
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<NacioEntity | null> {
    try {
      const geted = await this.repository.findById(id);
      return geted;
    } catch (error) {
      throw error;
    }
  }

  public async create(data: NacioEntity): Promise<NacioEntity | null> {
    try {
      const value = new NacioValue(data).toJson();
      const created = await this.repository.create(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: number, data: NacioEntity): Promise<NacioEntity | null> {
    try {
      await this.findById(id);
      const value = new NacioValue(data);
      const updated = await this.repository.update(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<NacioEntity | null> {
    try {
      await this.findById(id);
      const deleted = await this.repository.delete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

