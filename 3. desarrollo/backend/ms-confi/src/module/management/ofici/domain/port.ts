import { OficiEntity, OficiParams } from "./entity";

export interface OficiPort {
    findAll(params: OficiParams): Promise<{ data: OficiEntity[]; total: number }>;
    findById(id: number): Promise<OficiEntity | null>;
    create(data: OficiEntity): Promise<OficiEntity | null>;
    update(id: number, data: OficiEntity): Promise<OficiEntity | null>;
    delete(id: number): Promise<OficiEntity | null>;
}