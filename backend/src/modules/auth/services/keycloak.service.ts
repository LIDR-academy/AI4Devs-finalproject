import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

export interface KeycloakUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;
  private readonly realm: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('auth.keycloak.baseUrl') || 'http://localhost:8080';
    this.realm = this.configService.get<string>('auth.keycloak.realm') || 'sistema-quirurgico';
    this.clientId = this.configService.get<string>('auth.keycloak.clientId') || 'backend-api';
    this.clientSecret = this.configService.get<string>('auth.keycloak.clientSecret') || '';

    this.axiosInstance = axios.create({
      baseURL: `${this.baseUrl}/realms/${this.realm}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Autentica usuario con Keycloak usando password grant
   */
  async authenticate(username: string, password: string): Promise<KeycloakTokenResponse> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('username', username);
      params.append('password', password);

      const response = await this.axiosInstance.post('/protocol/openid-connect/token', params);

      return response.data;
    } catch (error: any) {
      this.logger.error(`Error en autenticación Keycloak: ${error.message}`, error.response?.data);
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  /**
   * Verificar si Keycloak está disponible
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health/ready`, {
        timeout: 2000,
      });
      return response.status === 200;
    } catch (error: any) {
      this.logger.debug(`Keycloak no disponible: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtiene información del usuario desde Keycloak
   */
  async getUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
    try {
      const response = await this.axiosInstance.get('/protocol/openid-connect/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      this.logger.error(`Error obteniendo información de usuario: ${error.message}`);
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Refresca el access token usando refresh token
   */
  async refreshToken(refreshToken: string): Promise<KeycloakTokenResponse> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('refresh_token', refreshToken);

      const response = await this.axiosInstance.post('/protocol/openid-connect/token', params);

      return response.data;
    } catch (error: any) {
      this.logger.error(`Error refrescando token: ${error.message}`);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  /**
   * Cierra sesión en Keycloak
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('refresh_token', refreshToken);

      await this.axiosInstance.post('/protocol/openid-connect/logout', params);
    } catch (error: any) {
      this.logger.error(`Error en logout: ${error.message}`);
      // No lanzamos error, solo logueamos
    }
  }

  /**
   * Verifica código TOTP para MFA
   */
  async verifyMfa(username: string, password: string, totpCode: string): Promise<KeycloakTokenResponse> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('username', username);
      params.append('password', password);
      params.append('totp', totpCode);

      const response = await this.axiosInstance.post('/protocol/openid-connect/token', params);

      return response.data;
    } catch (error: any) {
      this.logger.error(`Error verificando MFA: ${error.message}`);
      throw new UnauthorizedException('Código MFA inválido');
    }
  }

  /**
   * Obtiene roles del usuario
   */
  getRolesFromUserInfo(userInfo: KeycloakUserInfo): string[] {
    const roles: string[] = [];

    // Roles del realm
    if (userInfo.realm_access?.roles) {
      roles.push(...userInfo.realm_access.roles);
    }

    // Roles del cliente específico
    if (userInfo.resource_access?.[this.clientId]?.roles) {
      roles.push(...userInfo.resource_access[this.clientId].roles);
    }

    return [...new Set(roles)]; // Eliminar duplicados
  }
}
