import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { AuthController } from 'app/modules/auth/infrastructure/controller/controller';
import { TokenStorageService } from 'app/modules/auth/infrastructure/services/token-storage.service';
import { AuthAdapter } from 'app/modules/auth/infrastructure/adapters/auth.adapter';
import { Observable, catchError, throwError, switchMap, BehaviorSubject } from 'rxjs';
import { firstValueFrom } from 'rxjs';

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Intercept HTTP requests and responses
 * - Agrega token de autorización a las peticiones
 * - Maneja refresh token automático en 401
 * - Detecta estado offline
 *
 * @param req
 * @param next
 */
export const Interceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthController);
    const tokenStorage = inject(TokenStorageService);
    const authAdapter = inject(AuthAdapter);
    const router = inject(Router);

    // Rutas que no requieren token
    const publicRoutes = ['/auth/login', '/auth/forgot-password', '/auth/reset-password', '/health'];
    const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

    // Clone the request object
    let newReq = req.clone();

    // Request: Agregar token de autorización si existe y no ha expirado
    const accessToken = tokenStorage.getAccessToken() || authService.accessToken;
    
    if (accessToken && !isPublicRoute && !AuthUtils.isTokenExpired(accessToken)) {
        newReq = req.clone({
            headers: req.headers.set(
                'Authorization',
                'Bearer ' + accessToken
            ),
        });
    }

    // Response
    return next(newReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Solo loggear errores en desarrollo y si no son errores esperados (401 se maneja aparte)
            if (!error.url?.includes('/auth/login') && error.status !== 401) {
                console.error('ERROR en interceptor:', {
                    url: error.url,
                    status: error.status,
                    statusText: error.statusText,
                    error: error.error
                });
            }
            type color = | 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';

            // Manejar error 401 (Unauthorized) - Intentar refresh token
            if (error.status === 401 && !isPublicRoute) {
                return handle401Error(req, next, tokenStorage, authAdapter, router);
            }

            // Manejar error de red (status = 0 o 504)
            if (error.status === 0 || error.status === 504) {
                const customError = {
                    title: 'Error de red',
                    message: 'Upps. Tenemos una intermitencia con uno de nuestros servicios. Ya estamos trabajando para solucionarlo lo antes posible.',
                    status: 503,
                    color: 'warn' as color
                };
                return throwError(() => customError);
            }

            // Manejar otros errores
            let customError: { title: string; message: string; status: number; detail?: string, color: color } = {
                title: 'Error',
                message: 'Ocurrió un error inesperado',
                status: error.status,
                color: 'warn'
            };

            if (error.error?.meta) {
                const meta: {
                    information: {
                        action: string;
                        message: string;
                        method: string;
                        resource: string;
                        type: string;
                    };
                    pagination: null;
                    status: number;
                    error: any;
                    detail: any;
                } = error.error.meta;

                customError = {
                    title: 'Error',
                    message: meta?.information.message || 'Ha ocurrido un error en el servidor',
                    status: meta?.status || error.status,
                    detail: meta?.detail || undefined,
                    color: 'warn'
                };

                if (meta.status === 400) {
                    if (meta.information?.message?.toLocaleLowerCase().includes('[RPC]'.toLocaleLowerCase())) {
                        customError.title = 'Conexión Inestable';
                        customError.message = 'Estamos teniendo dificultades para conectarnos. Por favor, inténtalo nuevamente en unos minutos.';
                        customError.color = 'error';
                    } else {
                        customError.title = 'Error en la solicitud';
                        customError.color = 'warning';
                        customError.detail = meta?.information?.message || 'No se pudo completar la solicitud';
                    }
                }
                if (error.status === 401) {
                    customError.message = 'Su sesión ha expirado o no está autorizada';
                }
                if (meta.error) {
                    try {
                        const parsedError = JSON.parse(meta.error);
                        customError.detail = parsedError?.code || meta.detail;
                    } catch {
                        customError.detail = meta.error;
                    }
                }
            }

            return throwError(() => customError);
        })
    );
};

/**
 * Maneja errores 401 intentando refrescar el token
 */
function handle401Error(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
    tokenStorage: TokenStorageService,
    authAdapter: AuthAdapter,
    router: Router
): Observable<HttpEvent<unknown>> {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        const refreshToken = tokenStorage.getRefreshToken();
        
        if (refreshToken) {
            return authAdapter.refreshToken().pipe(
                switchMap((tokenResponse) => {
                    isRefreshing = false;
                    tokenStorage.saveTokens(tokenResponse.accessToken, tokenResponse.refreshToken);
                    refreshTokenSubject.next(tokenResponse.accessToken);

                    // Reintentar la petición original con el nuevo token
                    return next(addTokenToRequest(req, tokenResponse.accessToken));
                }),
                catchError((error) => {
                    isRefreshing = false;
                    // Si el refresh falla, limpiar tokens y redirigir a login
                    tokenStorage.clearTokens();
                    router.navigate(['/auth/login']);
                    return throwError(() => error);
                })
            );
        } else {
            // No hay refresh token, limpiar y redirigir
            isRefreshing = false;
            tokenStorage.clearTokens();
            router.navigate(['/auth/login']);
            return throwError(() => new Error('No hay refresh token disponible'));
        }
    } else {
        // Ya se está refrescando, esperar a que termine
        return refreshTokenSubject.pipe(
            switchMap((token) => {
                if (token) {
                    return next(addTokenToRequest(req, token));
                } else {
                    return throwError(() => new Error('Error al refrescar token'));
                }
            })
        );
    }
}

/**
 * Agrega el token a la petición
 */
function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
    });



};
