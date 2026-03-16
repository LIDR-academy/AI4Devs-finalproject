import { IconsEntity, IconsParams } from "./entity";

export interface IconsPort {
    findAll(params: IconsParams): Promise<{ data: IconsEntity[], total: number }>;
    findAllByColor(params: IconsParams, id: number): Promise<{ data: IconsEntity[], total: number }>;
    findById(id: number): Promise<IconsEntity | null>;
    create(data: IconsEntity): Promise<IconsEntity | null>;
    update(id: number, data: IconsEntity): Promise<IconsEntity | null>;
    delete(id: number): Promise<IconsEntity | null>;
}