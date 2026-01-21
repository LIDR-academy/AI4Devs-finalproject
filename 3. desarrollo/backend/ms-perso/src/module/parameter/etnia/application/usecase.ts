import { EtniaEntity, EtniaParams } from "../domain/entity";
import { EtniaPort } from "../domain/port";
import { EtniaValue } from "../domain/value";

export class EtniaUseCase implements EtniaPort {
  constructor(private readonly repository: EtniaPort) { }

  public async findAll(params: EtniaParams): Promise<{ data: EtniaEntity[]; total: number; }> {
    try {
      const listed = await this.repository.findAll(params);
      return listed;
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<EtniaEntity | null> {
    try {
      const geted = await this.repository.findById(id);
      return geted;
    } catch (error) {
      throw error;
    }
  }

  public async create(data: EtniaEntity): Promise<EtniaEntity | null> {
    try {
      const value = new EtniaValue(data).toJson();
      const created = await this.repository.create(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: number, data: EtniaEntity): Promise<EtniaEntity | null> {
    try {
      await this.findById(id);
      const value = new EtniaValue(data);
      const updated = await this.repository.update(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<EtniaEntity | null> {
    try {
      await this.findById(id);
      const deleted = await this.repository.delete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

