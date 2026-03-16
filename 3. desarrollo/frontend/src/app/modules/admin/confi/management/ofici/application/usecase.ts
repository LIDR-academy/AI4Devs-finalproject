import { ApiResponse, ApiResponses } from "app/shared/utils";
import { OficiEntity, OficiParams } from "../domain/entity";
import { OficiPort } from "../domain/port";
import { OficiValue } from "../domain/value";
import { Observable } from "rxjs";

export class OficiUseCase implements OficiPort {

    constructor(private readonly repository: OficiPort) { }

    public findAll(params: OficiParams): Observable<ApiResponses<OficiEntity>> {
        try {
            const geted = this.repository.findAll(params);
            return geted;
        } catch (error) {
            throw error;
        }
    }
    public findById(id: number): Observable<ApiResponse<OficiEntity>> {
        try {
            const geted = this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public create(data: OficiEntity): Observable<ApiResponse<OficiEntity>> {
        try {
            const value = new OficiValue(data).toBaseFields();
            const created = this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public update(id: number, data: OficiEntity): Observable<ApiResponse<OficiEntity>> {
        try {
            const value = new OficiValue(data, id).toBaseFields();
            const updated = this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public delete(id: number): Observable<ApiResponse<OficiEntity | null>> {
        try {
            this.findById(id);
            const deleted = this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}