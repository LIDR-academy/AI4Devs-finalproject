import { OpcioEntity, OpcioParams } from "../domain/entity";
import { OpcioPort } from "../domain/port";
import { OpcioValue } from "../domain/value";

export class OpcioUseCase implements OpcioPort {

    constructor(private readonly repository: OpcioPort) { }

    public async findAll(params: OpcioParams): Promise<{ data: OpcioEntity[]; total: number; }> {
        try {
            const listed = await this.repository.findAll(params);
            listed.data = this.buildOpcioTree(listed.data.map(item => new OpcioValue(item).toJson()));
            return listed;
        } catch (error) {
            throw error;
        }
    }

    private buildOpcioTree(data: OpcioEntity[]): OpcioEntity[] {
        const map = new Map<string, OpcioEntity>();
        const roots: OpcioEntity[] = [];

        // Inicializar cada nodo y meterlo al mapa
        for (const item of data) {
            const node: OpcioEntity = { ...item, opcio_men_opcio: [] };
            map.set(item.opcio_cod_opcio || '', node);
        }

        // Asignar hijos
        for (const item of data) {
            const node = map.get(item.opcio_cod_opcio || '')!;

            if (item.opcio_cod_padre) {
                const parent = map.get(item.opcio_cod_padre);
                if (parent) {
                    parent.opcio_men_opcio!.push(node);
                }
            } else {
                roots.push(node); // Sin padre = raíz
            }
        }

        return roots;
    }


    public async findById(id: string): Promise<OpcioEntity | null> {
        try {
            const geted = await this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public async create(data: OpcioEntity): Promise<OpcioEntity | null> {
        try {
            const value = new OpcioValue(data).toJson();
            const created = await this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public async update(id: string, data: OpcioEntity): Promise<OpcioEntity | null> {
        try {
            await this.findById(id);
            const value = new OpcioValue(data, id).toJson();
            const updated = await this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public async delete(id: string): Promise<OpcioEntity | null> {
        try {
            await this.findById(id);
            const deleted = await this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}