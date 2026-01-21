import { TidenEntity, TidenParams } from "./entity";

export interface TidenPort {
    findAll(params: TidenParams): Promise<{ data: TidenEntity[], total: number }>;
    findById(id: number): Promise<TidenEntity | null>;
    create(data: TidenEntity): Promise<TidenEntity | null>;
    update(id: number, data: TidenEntity): Promise<TidenEntity | null>;
    delete(id: number): Promise<TidenEntity | null>;
}