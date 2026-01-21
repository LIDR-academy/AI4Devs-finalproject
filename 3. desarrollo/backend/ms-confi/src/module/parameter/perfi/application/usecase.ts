import { PerfiEntity, PerfiParams } from "../domain/entity";
import { PerfiPort } from "../domain/port";
import { PerfiValue } from "../domain/value";

export class PerfiUseCase implements PerfiPort {

    constructor(private readonly repository: PerfiPort) { }

    public async findAll(params: PerfiParams): Promise<{ data: PerfiEntity[]; total: number; }> {
        try {
            const listed = await this.repository.findAll(params);
            return listed;
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<PerfiEntity | null> {
        try {
            const geted = await this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public async create(data: PerfiEntity): Promise<PerfiEntity | null> {
        try {
            const value = new PerfiValue(data).toJson();
            const created = await this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public async update(id: number, data: PerfiEntity): Promise<PerfiEntity | null> {
        try {
            await this.findById(id);
            const value = new PerfiValue(data, id).toJson();
            const updated = await this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: number): Promise<PerfiEntity | null> {
        try {
            await this.findById(id);
            const deleted = await this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}