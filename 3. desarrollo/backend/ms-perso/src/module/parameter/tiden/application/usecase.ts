import { TidenEntity, TidenParams } from "../domain/entity";
import { TidenPort } from "../domain/port";
import { TidenValue } from "../domain/value";

export class TidenUseCase implements TidenPort {

    constructor(private readonly repository: TidenPort) { }

    public async findAll(params: TidenParams): Promise<{ data: TidenEntity[]; total: number; }> {
        try {
            const listed = await this.repository.findAll(params);
            return listed;
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<TidenEntity | null> {
        try {
            const geted = await this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public async create(data: TidenEntity): Promise<TidenEntity | null> {
        try {
            const value = new TidenValue(data).toJson();
            const created = await this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public async update(id: number, data: TidenEntity): Promise<TidenEntity | null> {
        try {
            await this.findById(id);
            const value = new TidenValue(data);
            const updated = await this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: number): Promise<TidenEntity | null> {
        try {
            await this.findById(id);
            const deleted = await this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}