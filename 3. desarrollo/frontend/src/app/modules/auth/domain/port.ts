import { Observable } from "rxjs";
import { AuthEntity, SignInInterface } from "./entity";
import { ApiResponse } from "app/shared/utils/response";

export interface AuthPort {
    signIn(data: SignInInterface): Observable<ApiResponse<AuthEntity>>;
    signOut(id: number): Observable<ApiResponse<AuthEntity>>;
    verifyToken(token: string): Observable<ApiResponse<AuthEntity>>;
    refreshToken(token: string): Observable<ApiResponse<AuthEntity>>;
    findUserInfo(id: number): Observable<ApiResponse<AuthEntity>>;
}