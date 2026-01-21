import { EmpreEntity } from "./entity";

export interface EmprePort {
    findAll(): Promise<EmpreEntity | null>;
    findById(id: number): Promise<EmpreEntity | null>;
    create(data: EmpreEntity): Promise<EmpreEntity | null>;
    update(id: number, data: EmpreEntity): Promise<EmpreEntity | null>;
    delete(id: number): Promise<EmpreEntity | null>;
}