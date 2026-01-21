import { ColorEntity, ColorParams } from "../domain/entity";
import { ColorPort } from "../domain/port";
import { ColorValue } from "../domain/value";

export class ColorUseCase implements ColorPort {

    constructor(private readonly repository: ColorPort) { }

    public async findAll(params: ColorParams): Promise<{ data: ColorEntity[]; total: number; }> {
        try {
            const listed = await this.repository.findAll(params);
            return listed;
        } catch (error) {
            throw error;
        }
    }

    public async findById(id: number): Promise<ColorEntity | null> {
        try {
            const geted = await this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public async create(data: ColorEntity): Promise<ColorEntity | null> {
        try {
            const value = new ColorValue(data).toJson();
            const created = await this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public async update(id: number, data: ColorEntity): Promise<ColorEntity | null> {
        try {
            await this.findById(id);
            const value = new ColorValue(data, id).toJson();
            const updated = await this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: number): Promise<ColorEntity | null> {
        try {
            await this.findById(id);
            const deleted = await this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}