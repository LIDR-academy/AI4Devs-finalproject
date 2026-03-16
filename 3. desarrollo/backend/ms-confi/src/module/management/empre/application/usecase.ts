import { EmpreEntity, EmpreParams } from "../domain/entity";
import { EmprePort } from "../domain/port";
import { EmpreValue } from "../domain/value";

export class EmpreUseCase implements EmprePort {

    constructor(private readonly repository: EmprePort) { }

    public async findAll(): Promise<EmpreEntity | null> {
        try {
            const geted = await this.repository.findAll();
            return geted;
        } catch (error) {
            throw error;
        }
    }
    public async findById(id: number): Promise<EmpreEntity | null> {
        try {
            const geted = await this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public async create(data: EmpreEntity): Promise<EmpreEntity | null> {
        try {
            const value = new EmpreValue(data).toJson();
            const created = await this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public async update(id: number, data: EmpreEntity): Promise<EmpreEntity | null> {
        try {
            await this.findById(id);
            const value = new EmpreValue(data, id).toJson();
            const updated = await this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: number): Promise<EmpreEntity | null> {
        try {
            await this.findById(id);
            const deleted = await this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}