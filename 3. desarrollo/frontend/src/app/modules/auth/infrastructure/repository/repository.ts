import { inject, Injectable } from '@angular/core';
import { AuthPort } from '../../domain/port';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { AuthEntity, SignInInterface } from '../../domain/entity';
import { AuthEnum } from '../enum/enum';
import { ApiResponse } from 'app/shared/utils/response';


@Injectable({ providedIn: 'root' })
export class AuthRepository implements AuthPort {

    private _httpClient = inject(HttpClient);
    constructor() {
    }

    signOut(id: number): Observable<ApiResponse<AuthEntity>> {
        throw new Error('Method not implemented.');
    }

    refreshToken(token: string): Observable<ApiResponse<AuthEntity>> {
        throw new Error('Method not implemented.');
    }
    findUserInfo(id: number): Observable<ApiResponse<AuthEntity>> {
        throw new Error('Method not implemented.');
    }


    public signIn(data: SignInInterface): Observable<ApiResponse<AuthEntity>> {
        try {
            return this._httpClient.post(AuthEnum.signIn, data).pipe(
                switchMap((response: any) => {
                    return of(response);
                })
            );
        } catch (error) {
            throw error;
        }
    }

    public verifyToken(token: string): Observable<ApiResponse<AuthEntity>> {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            return this._httpClient.get<AuthEntity>(AuthEnum.verifyToken, { headers }).pipe(
                switchMap((response: any) => { return of(response); })
            );
        } catch (error) {
            throw error;
        }
    }


}