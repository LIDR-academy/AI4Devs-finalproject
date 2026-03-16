import { Observable } from "rxjs";
import { OpcioEntity, OpcioParams } from "../domain/entity";
import { OpcioPort } from "../domain/port";
import { OpcioValue } from "../domain/value";
import { ApiResponse, ApiResponses } from "app/shared/utils/response";

export class OpcioUseCase implements OpcioPort {

    constructor(private readonly repository: OpcioPort) { }

    public findAll(params: OpcioParams): Observable<ApiResponses<OpcioEntity>> {
        try {
            const listed = this.repository.findAll(params);
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


    public findById(id: number): Observable<ApiResponse<OpcioEntity>> {
        try {
            const geted = this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public create(data: OpcioEntity): Observable<ApiResponse<OpcioEntity>> {
        try {
            const value = new OpcioValue(data).toJson();
            const created = this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public update(id: number, data: OpcioEntity): Observable<ApiResponse<OpcioEntity>> {
        try {
            const value = new OpcioValue(data);
            const updated = this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public delete(id: number): Observable<ApiResponse<OpcioEntity>> {
        try {
            const deleted = this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}