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
    const response = await fetch(`${baseUrl}/auth/login-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, pin }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error de autenticacion por PIN.');
    }

    // Persistir credenciales de sesion
    localStorage.setItem(AuthService.STORAGE_KEY, data.accessToken);
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(data.user));

    return data as LoginPinResponse;
  }

  public static getToken(): string | null {
    return localStorage.getItem(AuthService.STORAGE_KEY);
  }

  public static getStoredUser(): { id: string; name: string; role: string } | null {
    const raw = localStorage.getItem(AuthService.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
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
