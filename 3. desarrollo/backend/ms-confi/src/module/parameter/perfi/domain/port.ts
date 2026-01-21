import { PerfiEntity, PerfiParams } from "./entity";

export interface PerfiPort {
    findAll(params: PerfiParams): Promise<{ data: PerfiEntity[], total: number }>;
    findById(id: number): Promise<PerfiEntity | null>;
    create(data: PerfiEntity): Promise<PerfiEntity | null>;
    update(id: number, data: PerfiEntity): Promise<PerfiEntity | null>;
    delete(id: number): Promise<PerfiEntity | null>;
}