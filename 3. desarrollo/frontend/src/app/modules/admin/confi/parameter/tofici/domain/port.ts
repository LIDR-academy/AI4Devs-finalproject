import { Observable } from "rxjs";
import { ToficEntity, ToficParams } from "./entity";
import { ApiResponse, ApiResponses } from "app/shared/utils";

export interface ToficPort {
    findAll(params: ToficParams): Observable<ApiResponses<ToficEntity>>;
    findById(id: number): Observable<ApiResponse<ToficEntity>>;
    create(data: ToficEntity): Observable<ApiResponse<ToficEntity>>;
    update(id: number, data: ToficEntity): Observable<ApiResponse<ToficEntity>>;
    delete(id: number): Observable<ApiResponse<ToficEntity>>;
}