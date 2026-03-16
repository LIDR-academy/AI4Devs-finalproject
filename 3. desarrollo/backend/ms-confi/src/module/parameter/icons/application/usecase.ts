import { IconsEntity, IconsParams } from "../domain/entity";
import { IconsPort } from "../domain/port";
import { IconsValue } from "../domain/value";

export class IconsUseCase implements IconsPort {

    constructor(private readonly repository: IconsPort) { }

    public async findAll(params: IconsParams): Promise<{ data: IconsEntity[]; total: number; }> {
        try {
            const listed = await this.repository.findAll(params);
            return listed;
        } catch (error) {
            throw error;
        }
    }

    public async findAllByColor(params: IconsParams, id: number): Promise<{ data: IconsEntity[]; total: number; }> {
        try {
            const listed = await this.repository.findAllByColor(params, id);
            return listed;
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<IconsEntity | null> {
        try {
            const geted = await this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public async create(data: IconsEntity): Promise<IconsEntity | null> {
        try {
            const value = new IconsValue(data).toJson();
            const created = await this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public async update(id: number, data: IconsEntity): Promise<IconsEntity | null> {
        try {
            await this.findById(id);
            const value = new IconsValue(data, id).toJson();
            const updated = await this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: number): Promise<IconsEntity | null> {
        try {
            await this.findById(id);
            const deleted = await this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}