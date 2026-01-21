import { inject, Injectable } from '@angular/core';
import { ToficPort } from '../../domain/port';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { ToficEntity, ToficParams } from '../../domain/entity';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';
import { ToficEnum } from '../enum/enum';


@Injectable({ providedIn: 'root' })
export class ToficDBRepository implements ToficPort {

    private _httpClient = inject(HttpClient);
    constructor() {
    }

    public findAll(params: ToficParams): Observable<ApiResponses<ToficEntity>> {
        try {
            return this._httpClient.get<ApiResponses<ToficEntity>>(ToficEnum.api, { params: { ...params } });
        } catch (error) {
            throw error;
        }
    }

    public findById(id: number): Observable<ApiResponse<ToficEntity>> {
        try {
            return this._httpClient.get<ApiResponse<ToficEntity>>(`${ToficEnum.api}/${id}`);
        } catch (error) {
            throw error;
        }
    }
    public create(data: ToficEntity): Observable<ApiResponse<ToficEntity>> {
        try {
            return this._httpClient.post<ApiResponse<ToficEntity>>(ToficEnum.api, data);
        } catch (error) {
            throw error;
        }
    }

    public update(id: number, data: ToficEntity): Observable<ApiResponse<ToficEntity>> {
        try {
            return this._httpClient.put<ApiResponse<ToficEntity>>(`${ToficEnum.api}/${id}`, data);
        } catch (error) {
            throw error;
        }
    }

    public delete(id: number): Observable<ApiResponse<ToficEntity>> {
        try {
            return this._httpClient.delete<ApiResponse<ToficEntity>>(`${ToficEnum.api}/${id}`);
        } catch (error) {
            throw error;
        }
    }




}