import api from '@/utils/api';
import { LoginCredentials, LoginResponse, User } from '@/types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('Intentando login con:', { email: credentials.email });
      const response = await api.post<any>('/auth/login', credentials);
      
      console.log('Respuesta completa del servidor:', response);
      console.log('response.data:', response.data);
      
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

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
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
