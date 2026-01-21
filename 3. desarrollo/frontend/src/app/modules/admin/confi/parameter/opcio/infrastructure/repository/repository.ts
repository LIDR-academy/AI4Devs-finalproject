import { inject, Injectable } from '@angular/core';
import { OpcioPort } from '../../domain/port';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { OpcioEntity, OpcioParams } from '../../domain/entity';
import { OpcioEnum } from '../enum/enum';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';


@Injectable({ providedIn: 'root' })
export class OpcioRepository implements OpcioPort {

    private _httpClient = inject(HttpClient);
    constructor() {
    }

    public findAll(params: OpcioParams): Observable<ApiResponses<OpcioEntity>> {
        try {
            return this._httpClient.get<ApiResponses<OpcioEntity>>(OpcioEnum.api, { params: { ...params } }).pipe(
                switchMap((res: ApiResponses<OpcioEntity>) => {
                    return of(res);
                })
            );
        } catch (error) {
            throw error;
        }
    }
    
    findById(id: number): Observable<ApiResponse<OpcioEntity>> {
        throw new Error('Method not implemented.');
    }
    create(data: OpcioEntity): Observable<ApiResponse<OpcioEntity>> {
        throw new Error('Method not implemented.');
    }
    update(id: number, data: OpcioEntity): Observable<ApiResponse<OpcioEntity>> {
        throw new Error('Method not implemented.');
    }
    delete(id: number): Observable<ApiResponse<OpcioEntity>> {
        throw new Error('Method not implemented.');
    }




}