import { OficiEntity, OficiParams } from "../domain/entity";
import { OficiPort } from "../domain/port";
import { OficiValue } from "../domain/value";

export class OficiUseCase implements OficiPort {

    constructor(private readonly repository: OficiPort) { }

    public async findAll(params: OficiParams): Promise<{ data: OficiEntity[]; total: number }> {
        try {
            const geted = await this.repository.findAll(params);
            return geted;
        } catch (error) {
            throw error;
        }
    }
    public async findById(id: number): Promise<OficiEntity | null> {
        try {
            const geted = await this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public async create(data: OficiEntity): Promise<OficiEntity | null> {
        try {
            const value = new OficiValue(data).toJson();
            const created = await this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public async update(id: number, data: OficiEntity): Promise<OficiEntity | null> {
        try {
            await this.findById(id);
            const value = new OficiValue(data, id).toJson();
            const updated = await this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: number): Promise<OficiEntity | null> {
        try {
            await this.findById(id);
            const deleted = await this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}