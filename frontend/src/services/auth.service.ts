import api from '@/utils/api';
import { LoginCredentials, LoginResponse, User } from '@/types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<any>('/auth/login', credentials);

      // El TransformInterceptor puede envolver la respuesta en { data: {...} }
      // Necesitamos manejar ambos casos: respuesta directa o envuelta
      let responseData = response.data;
      
      // Si la respuesta está envuelta en { data: {...}, statusCode, timestamp }
      if (responseData && responseData.data && typeof responseData.data === 'object' && !responseData.data.accessToken) {
        responseData = responseData.data;
      }
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!responseData) {
        console.error('Respuesta vacía del servidor');
        throw new Error('Respuesta inválida del servidor');
      }
      
      // El backend puede devolver accessToken o access_token
      const accessToken = responseData.accessToken || responseData.access_token;
      
      if (!accessToken) {
        console.error('No se encontró accessToken en la respuesta:', responseData);
        throw new Error('No se recibió token de acceso. Respuesta: ' + JSON.stringify(responseData));
      }
      
      // Si no hay user en la respuesta, crear uno básico desde el email
      let user = responseData.user;
      if (!user) {
        console.warn('El servidor no devolvió información del usuario, creando usuario básico');
        user = {
          id: responseData.userId || 'unknown',
          email: credentials.email,
          roles: responseData.roles || ['usuario'],
          username: credentials.email,
        };
      }
      
      // Normalizar la respuesta
      const loginResponse: LoginResponse = {
        accessToken: accessToken,
        user: user,
        devMode: responseData.devMode,
      };
      
      localStorage.setItem('token', loginResponse.accessToken);
      localStorage.setItem('user', JSON.stringify(loginResponse.user));
      
      return loginResponse;
    } catch (error: any) {
      console.error('Error en authService.login:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getUsers(): Promise<Array<{ id: string; email: string; firstName?: string; lastName?: string }>> {
    const response = await api.get<Array<{ id: string; email: string; firstName?: string; lastName?: string }>>('/auth/users');
    const data = (response.data as any)?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  }

  async getProfile(): Promise<User> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
    try {
      const response = await api.get<{ data?: { userId?: string; email?: string; roles?: string[] }; userId?: string; email?: string; roles?: string[] }>('/auth/profile', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const raw = response.data?.data ?? response.data;
      const r = raw as { userId?: string; sub?: string; id?: string; email?: string; roles?: string[] } | undefined;
      const userId = r?.userId ?? r?.sub ?? r?.id;
      const email = r?.email ?? '';
      const roles = Array.isArray(r?.roles) ? r.roles : ['usuario'];
      return {
        id: userId ?? email,
        email,
        roles,
        username: email,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async refreshToken(): Promise<string> {
    const response = await api.post<{ accessToken: string }>('/auth/refresh');
    const { accessToken } = response.data;
    localStorage.setItem('token', accessToken);
    return accessToken;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();
export default authService;
