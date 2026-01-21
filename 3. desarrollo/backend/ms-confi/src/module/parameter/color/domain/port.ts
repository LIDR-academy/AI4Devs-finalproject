import { ColorEntity, ColorParams } from "./entity";

export interface ColorPort {
    findAll(params: ColorParams): Promise<{ data: ColorEntity[], total: number }>;
    findById(id: number): Promise<ColorEntity | null>;
    create(data: ColorEntity): Promise<ColorEntity | null>;
    update(id: number, data: ColorEntity): Promise<ColorEntity | null>;
    delete(id: number): Promise<ColorEntity | null>;
}