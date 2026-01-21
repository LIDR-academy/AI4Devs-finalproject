import { InstrEntity, InstrParams } from "../domain/entity";
import { InstrPort } from "../domain/port";
import { InstrValue } from "../domain/value";

export class InstrUseCase implements InstrPort {
  constructor(private readonly repository: InstrPort) { }

  public async findAll(params: InstrParams): Promise<{ data: InstrEntity[]; total: number; }> {
    try {
      const listed = await this.repository.findAll(params);
      return listed;
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<InstrEntity | null> {
    try {
      const geted = await this.repository.findById(id);
      return geted;
    } catch (error) {
      throw error;
    }
  }

  public async create(data: InstrEntity): Promise<InstrEntity | null> {
    try {
      const value = new InstrValue(data).toJson();
      const created = await this.repository.create(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: number, data: InstrEntity): Promise<InstrEntity | null> {
    try {
      await this.findById(id);
      const value = new InstrValue(data);
      const updated = await this.repository.update(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<InstrEntity | null> {
    try {
      await this.findById(id);
      const deleted = await this.repository.delete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

