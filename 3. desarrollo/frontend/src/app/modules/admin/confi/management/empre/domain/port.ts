import { Observable } from "rxjs";
import { EmpreEntity } from "./entity";
import { ApiResponse } from "app/shared/utils";

export interface EmprePort {
    findAll(): Observable<ApiResponse<EmpreEntity>>;
    findById(id: number): Observable<ApiResponse<EmpreEntity>>;
    create(data: EmpreEntity): Observable<ApiResponse<EmpreEntity>>;
    update(id: number, data: EmpreEntity): Observable<ApiResponse<EmpreEntity>>;
    delete(id: number): Observable<ApiResponse<EmpreEntity>>;
}