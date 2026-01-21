import { Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { catchError, finalize, Observable, of, ReplaySubject, switchMap, tap, throwError } from 'rxjs';
import { AuthUseCase } from '../../application/usecase';
import { AuthRepository } from '../repository/repository';
import { Router } from '@angular/router';
import { AuthEntity, SignInInterface } from '../../domain/entity';
import { ApiResponse } from 'app/shared/utils/response';

@Injectable({ providedIn: 'root' })
export class AuthController {
    private readonly use_case: AuthUseCase;
    private _authenticated: boolean = false;
    private _user: ReplaySubject<AuthEntity> = new ReplaySubject<AuthEntity>(1);


    constructor(
        private readonly router: Router,
        private readonly repository: AuthRepository,

    ) {
        this.use_case = new AuthUseCase(this.repository);
    }

    set user(value: AuthEntity) {
        this._user.next(value);
    }

    get user$(): Observable<AuthEntity> {
        return this._user.asObservable();
    }

    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        throw new Error('forgotPassword:: Method not implemented.');
        //return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        throw new Error('resetPassword:: Method not implemented.');
        //return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */

    signIn(credentials: SignInInterface): Observable<ApiResponse<AuthEntity>> {
        // Throw error, if the user is already logged in
        if (this._authenticated) throw new Error('User is already logged in.');

        return this.use_case.signIn(credentials).pipe(
            catchError((error) => {
                console.log(error);
                // Return false
                throw error;
                //return of(false);
            }),
            switchMap((res: any) => {
                console.log(res);
                // Store the access token in the local storage
                this.accessToken = res.data.token.access;
                // Store the user on the user service
                this._user.next(res.data);
                // Set the authenticated flag to true
                this._authenticated = true;
                // Return a new observable with the response
                return of(res);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this.use_case.verifyToken(this.accessToken).pipe(
            catchError((error) => {
                // Return false
                return of(false);
            }),
            switchMap((res: any) => {
                console.log(res);
                // Replace the access token with the new one if it's available on
                // the response object.
                //
                // This is an added optional step for better security. Once you sign
                // in using the token, you should generate a new one on the server
                // side and attach it to the response object. Then the following
                // piece of code can replace the token with the refreshed one.
                if (res.data.token.access) {
                    this.accessToken = res.data.token.access;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._user.next(res.data);

                // Return true
                //throw new Error('signInUsingToken:: Method not implemented.');
                return of(true);
            })
        );

    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        // Set the authenticated flag to false
        this._authenticated = false;
        // Return the observable
        return of(false);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        throw new Error('signUp:: Method not implemented.');
        //return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string; }): Observable<any> {
        //return this._httpClient.post('api/auth/unlock-session', credentials);
        throw new Error('unlockSession:: Method not implemented.');
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // Si el token de acceso existe y no ha expirado, inicie sesión usándolo
        return this.signInUsingToken();
    }
}
