import { inject, Injectable } from '@angular/core';
import { EmprePort } from '../../domain/port';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { EmpreEntity } from '../../domain/entity';
import { ApiResponse } from 'app/shared/utils/response';
import { EmpreEnum } from '../enum/enum';


@Injectable({ providedIn: 'root' })
export class EmpreRepository implements EmprePort {

    private _httpClient = inject(HttpClient);
    constructor() {
    }

    public findAll(): Observable<ApiResponse<EmpreEntity>> {
        try {
            return this._httpClient.get<ApiResponse<EmpreEntity>>(EmpreEnum.api);
        } catch (error) {
            throw error;
        }
    }

    findById(id: number): Observable<ApiResponse<EmpreEntity>> {
        throw new Error('Method not implemented.');
    }
    create(data: EmpreEntity): Observable<ApiResponse<EmpreEntity>> {
        throw new Error('Method not implemented.');
    }

    public update(id: number, data: EmpreEntity): Observable<ApiResponse<EmpreEntity>> {
        try {
            return this._httpClient.put<ApiResponse<EmpreEntity>>(`${EmpreEnum.api}/${id}`, data);
        } catch (error) {
            throw error;
        }
    }
    delete(id: number): Observable<ApiResponse<EmpreEntity>> {
        throw new Error('Method not implemented.');
    }




}