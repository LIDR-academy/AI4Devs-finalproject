import { ApiResponse } from "app/shared/utils";
import { EmpreEntity } from "../domain/entity";
import { EmprePort } from "../domain/port";
import { EmpreValue } from "../domain/value";
import { Observable } from "rxjs";

export class EmpreUseCase implements EmprePort {

    constructor(private readonly repository: EmprePort) { }

    public findAll(): Observable<ApiResponse<EmpreEntity>> {
        try {
            const geted = this.repository.findAll();
            return geted;
        } catch (error) {
            throw error;
        }
    }
    public findById(id: number): Observable<ApiResponse<EmpreEntity>> {
        try {
            const geted = this.repository.findById(id);
            return geted;
        } catch (error) {
            throw error;
        }
    }

    public create(data: EmpreEntity): Observable<ApiResponse<EmpreEntity>> {
        try {
            const value = new EmpreValue(data).toJson();
            const created = this.repository.create(value);
            return created;
        } catch (error) {
            throw error;
        }
    }

    public update(id: number, data: EmpreEntity): Observable<ApiResponse<EmpreEntity>> {
        try {
            const value = new EmpreValue(data, id).toJson();
            const updated = this.repository.update(id, value);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    public delete(id: number): Observable<ApiResponse<EmpreEntity>> {
        try {
            const deleted = this.repository.delete(id);
            return deleted;
        } catch (error) {
            throw error;
        }
    }

}