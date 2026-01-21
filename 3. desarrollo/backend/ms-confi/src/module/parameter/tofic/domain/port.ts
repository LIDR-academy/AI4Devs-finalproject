import { ToficEntity, ToficParams } from "./entity";

export interface ToficPort {
    findAll(params: ToficParams): Promise<{ data: ToficEntity[], total: number }>;
    findById(id: number): Promise<ToficEntity | null>;
    create(data: ToficEntity): Promise<ToficEntity | null>;
    update(id: number, data: ToficEntity): Promise<ToficEntity | null>;
    delete(id: number): Promise<ToficEntity | null>;
}