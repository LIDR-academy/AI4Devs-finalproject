import { ApiResponse, ApiResponses } from "app/shared/utils";
import { ToficEntity, ToficParams } from "../domain/entity";
import { ToficPort } from "../domain/port";
import { ToficValue } from "../domain/value";
import { Observable } from "rxjs";

export class ToficUseCase implements ToficPort {

    constructor(private readonly repository: ToficPort) { }

    public findAll(params: ToficParams): Observable<ApiResponses<ToficEntity>> {
        try {
            const geted = this.repository.findAll(params);
            return geted;
        } catch (error) {
            throw error;
        }
    }
    public findById(id: number): Observable<ApiResponse<ToficEntity>> {
        try {
            const geted = this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public create(data: ToficEntity): Observable<ApiResponse<ToficEntity>> {
        try {
            const value = new ToficValue(data).toJson();
            const created = this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public update(id: number, data: ToficEntity): Observable<ApiResponse<ToficEntity>> {
        try {
            const value = new ToficValue(data, id).toJson();
            const updated = this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public delete(id: number): Observable<ApiResponse<ToficEntity | null>> {
        try {
            const deleted = this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}