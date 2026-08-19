export interface LoginPinResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export class AuthService {
  private static STORAGE_KEY = 'restostock_jwt_token';
  private static USER_KEY = 'restostock_user_info';

  public static async loginWithPin(userId: string, pin: string, baseUrl: string = '/api/v1'): Promise<LoginPinResponse> {
    try {
      const response = await fetch(`${baseUrl}/auth/login-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, pin }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(AuthService.STORAGE_KEY, data.accessToken);
        localStorage.setItem(AuthService.USER_KEY, JSON.stringify(data.user));
        return data as LoginPinResponse;
      }

      let errMessage = 'PIN de acceso invalido o incorrecto.';
      try {
        const errData = await response.json();
        errMessage = errData.message || errData.error || errMessage;
      } catch (errDataError) {
        console.warn('[AuthService] No se pudo parsear cuerpo JSON de error:', errDataError);
      }
      throw new Error(errMessage);
    } catch (err) {
      // Ningún error (de red, del servidor, o de validación de PIN) cae en una
      // sesión local falsa — todo error real del backend o de la red se propaga
      // tal cual al llamador, que es responsable de mostrarlo al usuario.
      throw err instanceof Error ? err : new Error('Error de autenticación desconocido.');
    }
  }

  public static getToken(): string | null {
    return localStorage.getItem(AuthService.STORAGE_KEY);
  }

  public static getStoredUser(): { id: string; name: string; role: string } | null {
    const raw = localStorage.getItem(AuthService.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (parseErr) {
      console.warn('[AuthService] Error parseando datos de usuario de localStorage:', parseErr);
      return null;
    }
  }

  public static saveSession(token: string, user: { id: string; name: string; role: string }): void {
    localStorage.setItem(AuthService.STORAGE_KEY, token);
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
  }

  public static logout(): void {
    localStorage.removeItem(AuthService.STORAGE_KEY);
    localStorage.removeItem(AuthService.USER_KEY);
  }
}
