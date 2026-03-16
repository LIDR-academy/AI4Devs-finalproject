import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { IAuthPort } from '../../domain/ports/auth.port';
import { LoginCredentials } from '../../domain/value-objects/login-credentials.vo';
import { AuthAdapter } from '../../infrastructure/adapters/auth.adapter';
import { AuthState, initialState } from '../../infrastructure/state/auth.state';
import { TokenStorageService } from '../../infrastructure/services/token-storage.service';
import { Router } from '@angular/router';

/**
 * Facade para gestión de estado de autenticación
 * Proporciona una interfaz unificada para componentes y servicios
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly state = new BehaviorSubject<AuthState>(initialState);
  private readonly CAPTCHA_THRESHOLD = 3; // Mostrar captcha después de 3 intentos fallidos

  // Selectores públicos (solo lectura)
  readonly user$ = this.select((state) => state.user);
  readonly isAuthenticated$ = this.select((state) => state.isAuthenticated);
  readonly isLoading$ = this.select((state) => state.isLoading);
  readonly error$ = this.select((state) => state.error);
  readonly failedAttempts$ = this.select((state) => state.failedAttempts);
  readonly remainingAttempts$ = this.select((state) => state.remainingAttempts);
  readonly requirePasswordChange$ = this.select((state) => state.requirePasswordChange);
  readonly captchaRequired$ = this.select((state) => state.captchaRequired);
  readonly serverOnline$ = this.select((state) => state.serverOnline);

  constructor(
    private readonly authAdapter: AuthAdapter,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router
  ) {
    this.checkStoredSession();
  }

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  async login(credentials: LoginCredentials): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const response = await firstValueFrom(this.authAdapter.login(credentials));
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      // Guardar tokens
      this.tokenStorage.saveTokens(response.accessToken, response.refreshToken);

      // Si hay que recordar usuario, guardarlo
      if (credentials.rememberMe) {
        this.tokenStorage.saveRememberedUsername(credentials.username);
      }

      // Actualizar estado
      this.updateState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        requirePasswordChange: response.requirePasswordChange || false,
        failedAttempts: 0, // Resetear intentos fallidos
        remainingAttempts: null,
        captchaRequired: false,
      });

      // Si requiere cambio de contraseña, no redirigir aún
      if (response.requirePasswordChange) {
        return;
      }

      // Si necesita seleccionar oficina, redirigir
      if (response.user.necesitaSeleccionarOficina()) {
        this.router.navigate(['/auth/select-office']);
        return;
      }

      // Redirigir al dashboard según perfil
      this.redirectToDashboard(response.user);
    } catch (error: any) {
      const errorMessage = error.message || 'Credenciales inválidas';
      const failedAttempts = this.state.value.failedAttempts + 1;
      const remainingAttempts = Math.max(0, 5 - failedAttempts); // Máximo 5 intentos

      this.updateState({
        isLoading: false,
        error: errorMessage,
        failedAttempts,
        remainingAttempts: remainingAttempts > 0 ? remainingAttempts : null,
        captchaRequired: failedAttempts >= this.CAPTCHA_THRESHOLD,
      });

      throw error;
    }
  }

  /**
   * Cierra la sesión actual
   */
  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.authAdapter.logout());
    } catch (error) {
      // Continuar con el logout aunque falle la llamada al servidor
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpiar tokens y estado
      this.tokenStorage.clearTokens();
      this.updateState(initialState);
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Solicita recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      await firstValueFrom(this.authAdapter.forgotPassword(email));
      this.updateState({ isLoading: false });
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Error al solicitar recuperación de contraseña',
      });
      throw error;
    }
  }

  /**
   * Restablece la contraseña con token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      await firstValueFrom(this.authAdapter.resetPassword(token, password));
      this.updateState({ isLoading: false });
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Error al restablecer contraseña',
      });
      throw error;
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   */
  async changePassword(current: string, newPassword: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      await firstValueFrom(this.authAdapter.changePassword(current, newPassword));
      this.updateState({
        isLoading: false,
        requirePasswordChange: false,
      });

      // Si el usuario necesita seleccionar oficina, redirigir
      const user = this.state.value.user;
      if (user?.necesitaSeleccionarOficina()) {
        this.router.navigate(['/auth/select-office']);
      } else if (user) {
        this.redirectToDashboard(user);
      }
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Error al cambiar contraseña',
      });
      throw error;
    }
  }

  /**
   * Fuerza login cerrando otras sesiones
   */
  async forceLogin(credentials: LoginCredentials): Promise<void> {
    // Por ahora es igual a login normal
    await this.login(credentials);
  }

  /**
   * Selecciona una oficina para la sesión actual
   */
  async selectOffice(officeId: number): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      await firstValueFrom(this.authAdapter.selectOffice(officeId));
      const user = this.state.value.user;
      if (user) {
        // Actualizar oficina del usuario
        const updatedUser = { ...user, oficinaId: officeId };
        this.updateState({
          user: updatedUser as any,
          isLoading: false,
        });
        this.redirectToDashboard(updatedUser as any);
      }
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Error al seleccionar oficina',
      });
      throw error;
    }
  }

  /**
   * Verifica el estado del servidor
   */
  async checkServerStatus(): Promise<void> {
    try {
      // TODO: Implementar health check cuando esté disponible
      // Por ahora asumimos que está online si podemos hacer una petición
      this.updateState({ serverOnline: true });
    } catch (error) {
      this.updateState({ serverOnline: false });
    }
  }

  /**
   * Limpia el error del estado
   */
  clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * Resetea el contador de intentos fallidos
   */
  resetFailedAttempts(): void {
    this.updateState({
      failedAttempts: 0,
      remainingAttempts: null,
      captchaRequired: false,
    });
  }

  /**
   * Redirige al dashboard según el perfil del usuario
   */
  private redirectToDashboard(user: any): void {
    // TODO: Implementar lógica de redirección según perfil
    // Por ahora redirigimos a una ruta genérica
    this.router.navigate(['/signed-in-redirect']);
  }

  /**
   * Verifica si hay una sesión almacenada válida
   */
  private checkStoredSession(): void {
    const accessToken = this.tokenStorage.getAccessToken();
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (accessToken && refreshToken) {
      // TODO: Verificar si el token es válido
      // Por ahora solo verificamos que exista
      // Se puede mejorar verificando expiración
    }
  }

  /**
   * Selector genérico para obtener valores del estado
   */
  private select<T>(selector: (state: AuthState) => T): Observable<T> {
    return this.state.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }

  /**
   * Actualiza el estado de forma inmutable
   */
  private updateState(partial: Partial<AuthState>): void {
    this.state.next({ ...this.state.value, ...partial });
  }
}

