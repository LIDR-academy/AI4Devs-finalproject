import { IfinaEntity, IfinaParams } from "../domain/entity";
import { IfinaPort } from "../domain/port";
import { IfinaValue } from "../domain/value";

export class IfinaUseCase implements IfinaPort {
  constructor(private readonly repository: IfinaPort) { }

  public async findAll(params: IfinaParams): Promise<{ data: IfinaEntity[]; total: number; }> {
    try {
      const listed = await this.repository.findAll(params);
      return listed;
    } catch (error) {
      throw error;
    }
  }

  public async findById(id: number): Promise<IfinaEntity | null> {
    try {
      const geted = await this.repository.findById(id);
      return geted;
    } catch (error) {
      throw error;
    }
  }

  public async create(data: IfinaEntity): Promise<IfinaEntity | null> {
    try {
      const value = new IfinaValue(data).toJson();
      const created = await this.repository.create(value);
      return created;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: number, data: IfinaEntity): Promise<IfinaEntity | null> {
    try {
      await this.findById(id);
      const value = new IfinaValue(data);
      const updated = await this.repository.update(id, value);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<IfinaEntity | null> {
    try {
      await this.findById(id);
      const deleted = await this.repository.delete(id);
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}

