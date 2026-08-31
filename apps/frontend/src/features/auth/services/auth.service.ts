export interface LoginPinResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    role: string;
    mustChangePin?: boolean;
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
      throw err instanceof Error ? err : new Error('Error de autenticación desconocido.');
    }
  }

  public static async changePin(userId: string, currentPin: string, newPin: string, baseUrl: string = '/api/v1'): Promise<void> {
    const token = AuthService.getToken();
    const response = await fetch(`${baseUrl}/auth/change-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, currentPin, newPin }),
    });

    if (!response.ok) {
      let errMessage = 'No se pudo actualizar el PIN.';
      try {
        const errData = await response.json();
        errMessage = errData.message || errData.detail || errMessage;
      } catch (parseError) {
        console.warn('[AuthService] Error parseando respuesta de error de changePin:', parseError);
      }

      throw new Error(errMessage);
    }

    const currentUser = AuthService.getStoredUser();
    if (currentUser) {
      currentUser.mustChangePin = false;
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(currentUser));
    }
  }

  public static getToken(): string | null {
    return localStorage.getItem(AuthService.STORAGE_KEY);
  }

  public static getStoredUser(): { id: string; name: string; role: string; mustChangePin?: boolean } | null {
    const raw = localStorage.getItem(AuthService.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (parseErr) {
      console.warn('[AuthService] Error parseando datos de usuario de localStorage:', parseErr);
      return null;
    }
  }

  public static saveSession(token: string, user: { id: string; name: string; role: string; mustChangePin?: boolean }): void {
    localStorage.setItem(AuthService.STORAGE_KEY, token);
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
  }

  public static async requestForgotPin(email: string, baseUrl: string = '/api/v1'): Promise<{ message: string }> {
    const response = await fetch(`${baseUrl}/auth/forgot-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Error al procesar la solicitud de recuperación.');
    }
    return data;
  }

  public static async resetAdminPin(token: string, newPin: string, baseUrl: string = '/api/v1'): Promise<{ message: string }> {
    const response = await fetch(`${baseUrl}/auth/reset-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPin }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'El token de recuperación es inválido o ha expirado.');
    }
    return data;
  }

  public static logout(): void {
    localStorage.removeItem(AuthService.STORAGE_KEY);
    localStorage.removeItem(AuthService.USER_KEY);
  }
}

