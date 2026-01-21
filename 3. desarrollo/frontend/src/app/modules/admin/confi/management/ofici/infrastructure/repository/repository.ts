import { inject, Injectable } from '@angular/core';
import { OficiPort } from '../../domain/port';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { OficiEntity, OficiParams } from '../../domain/entity';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';
import { OficiEnum } from '../enum/enum';


@Injectable({ providedIn: 'root' })
export class OficiRepository implements OficiPort {

    private _httpClient = inject(HttpClient);
    constructor() {
    }

    public findAll(params: OficiParams): Observable<ApiResponses<OficiEntity>> {
        try {
            return this._httpClient.get<ApiResponses<OficiEntity>>(OficiEnum.api, { params: { ...params } });
        } catch (error) {
            throw error;
        }
    }

    public findById(id: number): Observable<ApiResponse<OficiEntity>> {
        try {
            return this._httpClient.get<ApiResponse<OficiEntity>>(`${OficiEnum.api}/${id}`);
        } catch (error) {
            throw error;
        }
    }
    public create(data: OficiEntity): Observable<ApiResponse<OficiEntity>> {
        try {
            console.log('REPOSITORY CREATE', { data });

            return this._httpClient.post<ApiResponse<OficiEntity>>(OficiEnum.api, data);
        } catch (error) {
            throw error;
        }
    }

    public update(id: number, data: OficiEntity): Observable<ApiResponse<OficiEntity>> {
        try {
            console.log('REPOSITORY UPDATE', { id, data });

            return this._httpClient.put<ApiResponse<OficiEntity>>(`${OficiEnum.api}/${id}`, data);
        } catch (error) {
            throw error;
        }
    }

    public delete(id: number): Observable<ApiResponse<OficiEntity>> {
        try {
            return this._httpClient.delete<ApiResponse<OficiEntity>>(`${OficiEnum.api}/${id}`);
        } catch (error) {
            throw error;
        }
    }




}