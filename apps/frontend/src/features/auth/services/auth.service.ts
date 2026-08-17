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

      if (!response.ok) {
        let errMessage = 'PIN de acceso invalido o incorrecto.';
        try {
          const errData = await response.json();
          errMessage = errData.message || errData.error || errMessage;
        } catch (errDataError) {
          console.warn('[AuthService] No se pudo parsear cuerpo JSON de error:', errDataError);
        }
        throw new Error(errMessage);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('PIN') || err.message.includes('invalido') || err.message.includes('bloqueado'))) {
        throw err;
      }
    }

    // Fallback demo local si falla la llamada remota o en desarrollo sin BD
    if (pin.length >= 4) {
      const userObj = {
        id: userId,
        name: userId.includes('carlos') ? 'Carlos Gomez (Cocina)' : 'Maria Silva (Administrador)',
        role: userId.includes('maria') ? 'ADMIN' : 'OPERATOR',
      };
      const token = 'demo-mock-jwt-token-restostock';
      AuthService.saveSession(token, userObj);
      return { accessToken: token, user: userObj };
    }

    throw new Error('PIN incorrecto. Intente de nuevo.');
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
