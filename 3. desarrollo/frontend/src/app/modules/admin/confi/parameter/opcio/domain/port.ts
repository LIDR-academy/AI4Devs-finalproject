import { Observable } from "rxjs";
import { OpcioEntity, OpcioParams } from "./entity";
import { ApiResponse, ApiResponses } from "app/shared/utils/response";

export interface OpcioPort {
    findAll(params: OpcioParams): Observable<ApiResponses<OpcioEntity>>;
    findById(id: number): Observable<ApiResponse<OpcioEntity>>;
    create(data: OpcioEntity): Observable<ApiResponse<OpcioEntity>>;
    update(id: number, data: OpcioEntity): Observable<ApiResponse<OpcioEntity>>;
    delete(id: number): Observable<ApiResponse<OpcioEntity>>;
}