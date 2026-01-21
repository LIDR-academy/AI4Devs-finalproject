import { Injectable } from '@angular/core';

/**
 * Servicio para gestión de almacenamiento de tokens
 * Maneja el almacenamiento seguro de tokens y datos de sesión
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly REMEMBERED_USERNAME_KEY = 'rememberedUsername';

  /**
   * Guarda los tokens de acceso y refresh
   */
  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Obtiene el token de refresh
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Limpia todos los tokens
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Guarda el nombre de usuario recordado
   */
  saveRememberedUsername(username: string): void {
    localStorage.setItem(this.REMEMBERED_USERNAME_KEY, username);
  }

  /**
   * Obtiene el nombre de usuario recordado
   */
  getRememberedUsername(): string | null {
    return localStorage.getItem(this.REMEMBERED_USERNAME_KEY);
  }

  /**
   * Limpia el nombre de usuario recordado
   */
  clearRememberedUsername(): void {
    localStorage.removeItem(this.REMEMBERED_USERNAME_KEY);
  }

  /**
   * Verifica si hay tokens almacenados
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}

