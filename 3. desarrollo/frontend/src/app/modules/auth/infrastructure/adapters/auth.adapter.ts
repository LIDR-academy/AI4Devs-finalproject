import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError, firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IAuthPort, LoginResponse, TokenResponse } from '../../domain/ports/auth.port';
import { LoginCredentials } from '../../domain/value-objects/login-credentials.vo';
import { SessionEntity } from '../../domain/entities';
import { LoginRequestDto, LoginResponseDto } from '../dto';
import { UserMapper } from '../mappers/user.mapper';
import { envs } from 'app/common';
import { ApiResponse } from 'app/shared/utils/response';
import { AuthEntity } from '../../domain/entity';

/**
 * Adaptador HTTP para operaciones de autenticación
 * Implementa IAuthPort y se comunica con el backend
 */
@Injectable({ providedIn: 'root' })
export class AuthAdapter implements IAuthPort {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${envs.apiUrl}/rrfusuar`;

  /**
   * Inicia sesión con credenciales
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const request: LoginRequestDto = credentials.toPlain();

    return this.httpClient.post<ApiResponse<AuthEntity>>(`${this.baseUrl}/signIn`, request).pipe(
      map((response) => {
        // Convertir del formato actual del backend al nuevo formato
        const authEntity = response.data;
        const user = UserMapper.fromAuthEntity(authEntity);
        
        return {
          accessToken: authEntity.token.access,
          refreshToken: authEntity.token.refresh,
          expiresIn: 3600, // TODO: Obtener del backend si está disponible
          tokenType: 'Bearer' as const,
          user,
          requirePasswordChange: false, // TODO: Obtener del backend
        };
      }),
      catchError((error) => {
        // Manejar errores específicos del backend
        return throwError(() => this.mapError(error));
      })
    );
  }

  /**
   * Cierra la sesión actual
   */
  logout(): Observable<void> {
    return this.httpClient.post<void>(`${this.baseUrl}/signOut`, {}).pipe(
      catchError((error) => {
        // Si falla el logout, igualmente retornamos éxito para limpiar el estado local
        return new Observable<void>((subscriber) => {
          subscriber.next(undefined);
          subscriber.complete();
        });
      })
    );
  }

  /**
   * Refresca el token de acceso
   */
  refreshToken(): Observable<TokenResponse> {
    // TODO: Implementar cuando el backend lo soporte
    // Por ahora usamos el endpoint existente
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token disponible'));
    }

    return this.httpClient.post<ApiResponse<AuthEntity>>(`${this.baseUrl}/refreshToken`, {
      refreshToken,
    }).pipe(
      map((response) => {
        return {
          accessToken: response.data.token.access,
          refreshToken: response.data.token.refresh,
          expiresIn: 3600,
        };
      }),
      catchError((error) => throwError(() => this.mapError(error)))
    );
  }

  /**
   * Solicita recuperación de contraseña
   */
  forgotPassword(email: string): Observable<void> {
    // TODO: Implementar cuando el backend lo soporte
    return this.httpClient.post<void>(`${this.baseUrl}/forgotPassword`, { email }).pipe(
      catchError((error) => throwError(() => this.mapError(error)))
    );
  }

  /**
   * Restablece la contraseña con token
   */
  resetPassword(token: string, password: string): Observable<void> {
    // TODO: Implementar cuando el backend lo soporte
    return this.httpClient.post<void>(`${this.baseUrl}/resetPassword`, {
      token,
      password,
    }).pipe(
      catchError((error) => throwError(() => this.mapError(error)))
    );
  }

  /**
   * Cambia la contraseña del usuario autenticado
   */
  changePassword(current: string, newPassword: string): Observable<void> {
    // TODO: Implementar cuando el backend lo soporte
    return this.httpClient.post<void>(`${this.baseUrl}/changePassword`, {
      currentPassword: current,
      newPassword,
    }).pipe(
      catchError((error) => throwError(() => this.mapError(error)))
    );
  }

  /**
   * Fuerza login cerrando otras sesiones
   */
  forceLogin(credentials: LoginCredentials): Observable<LoginResponse> {
    // Por ahora, el force login es igual al login normal
    // TODO: Implementar endpoint específico cuando el backend lo soporte
    return this.login(credentials);
  }

  /**
   * Obtiene las sesiones activas del usuario
   */
  getActiveSessions(): Observable<SessionEntity[]> {
    // TODO: Implementar cuando el backend lo soporte
    return this.httpClient.get<SessionEntity[]>(`${this.baseUrl}/sessions`).pipe(
      catchError((error) => {
        // Si no está implementado, retornar array vacío
        return new Observable<SessionEntity[]>((subscriber) => {
          subscriber.next([]);
          subscriber.complete();
        });
      })
    );
  }

  /**
   * Selecciona una oficina para la sesión actual
   */
  selectOffice(officeId: number): Observable<void> {
    // TODO: Implementar cuando el backend lo soporte
    return this.httpClient.post<void>(`${this.baseUrl}/selectOffice`, { officeId }).pipe(
      catchError((error) => throwError(() => this.mapError(error)))
    );
  }

  /**
   * Obtiene el refresh token almacenado
   */
  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Mapea errores del backend a errores más descriptivos
   */
  private mapError(error: any): Error {
    if (error.error?.meta?.information?.message) {
      return new Error(error.error.meta.information.message);
    }
    if (error.error?.message) {
      return new Error(error.error.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('Error desconocido al comunicarse con el servidor');
  }
}

