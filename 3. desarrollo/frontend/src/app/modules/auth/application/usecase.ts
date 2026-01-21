import { Observable } from "rxjs";
import { AuthEntity, SignInInterface } from "../domain/entity";
import { AuthPort } from "../domain/port";
import { ApiResponse } from "app/shared/utils/response";

export class AuthUseCase implements AuthPort {

    constructor(private readonly repository: AuthPort) { }

    public signIn(data: SignInInterface): Observable<ApiResponse<AuthEntity>> {
        try {
            const signedIn = this.repository.signIn(data);
            console.log('Usuario autenticado:', signedIn);
            return signedIn;
        } catch (error) {
            throw error;
        }
    }

    public signOut(id: number): Observable<ApiResponse<AuthEntity>> {
        try {
            const signedOut = this.repository.signOut(id);
            return signedOut;
        } catch (error) {
            throw error;
        }
    }

    public findUserInfo(id: number): Observable<ApiResponse<AuthEntity>> {
        try {
            const userInfo = this.repository.findUserInfo(id);
            return userInfo;
        } catch (error) {
            throw error;
        }
    }

    public verifyToken(token: string): Observable<ApiResponse<AuthEntity>> {
        try {
            const verified = this.repository.verifyToken(token);
            return verified;
        } catch (error) {
            throw error;
        }
    }

    public refreshToken(token: string): Observable<ApiResponse<AuthEntity>> {
        try {
            const refreshed = this.repository.refreshToken(token);
            return refreshed;
        } catch (error) {
            throw error;
        }
    }
}