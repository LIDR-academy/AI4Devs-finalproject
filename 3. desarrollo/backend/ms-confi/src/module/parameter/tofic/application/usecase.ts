import { ToficEntity, ToficParams } from "../domain/entity";
import { ToficPort } from "../domain/port";
import { ToficValue } from "../domain/value";

export class ToficUseCase implements ToficPort {

    constructor(private readonly repository: ToficPort) { }

    public async findAll(params: ToficParams): Promise<{ data: ToficEntity[]; total: number; }> {
        try {
            const listed = await this.repository.findAll(params);
            return listed;
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<ToficEntity | null> {
        try {
            const geted = await this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public async create(data: ToficEntity): Promise<ToficEntity | null> {
        try {
            const value = new ToficValue(data).toJson();
            const created = await this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public async update(id: number, data: ToficEntity): Promise<ToficEntity | null> {
        try {
            await this.findById(id);
            const value = new ToficValue(data, id).toJson();
            const updated = await this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: number): Promise<ToficEntity | null> {
        try {
            await this.findById(id);
            const deleted = await this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}