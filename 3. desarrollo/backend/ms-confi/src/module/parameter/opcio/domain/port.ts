import { OpcioEntity, OpcioParams } from "./entity";

export interface OpcioPort {
    findAll(params: OpcioParams): Promise<{ data: OpcioEntity[], total: number }>;
    findById(id: string): Promise<OpcioEntity | null>;
    create(data: OpcioEntity): Promise<OpcioEntity | null>;
    update(id: string, data: OpcioEntity): Promise<OpcioEntity | null>;
    delete(id: string): Promise<OpcioEntity | null>;
}