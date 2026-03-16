import { Observable } from "rxjs";
import { OficiEntity, OficiParams } from "./entity";
import { ApiResponse, ApiResponses } from "app/shared/utils";

export interface OficiPort {
    findAll(params: OficiParams): Observable<ApiResponses<OficiEntity>>;
    findById(id: number): Observable<ApiResponse<OficiEntity>>;
    create(data: OficiEntity): Observable<ApiResponse<OficiEntity>>;
    update(id: number, data: OficiEntity): Observable<ApiResponse<OficiEntity>>;
    delete(id: number): Observable<ApiResponse<OficiEntity>>;
}