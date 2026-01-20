import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { KeycloakService } from './services/keycloak.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private keycloakService: KeycloakService,
  ) {}

  /**
   * Autentica usuario con Keycloak y genera tokens JWT
   */
  async login(loginDto: LoginDto) {
    try {
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Email y contraseña son requeridos');
      }

      this.logger.log(`Intentando autenticar usuario: ${loginDto.email}`);

      // Modo desarrollo: Si Keycloak no está disponible, generar token de prueba
      // Si NODE_ENV no está definido, asumimos desarrollo
      const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
      const isDevelopment = nodeEnv === 'development';
      
      // Verificar si Keycloak está disponible primero (solo en desarrollo)
      if (isDevelopment) {
        const keycloakAvailable = await this.keycloakService.isAvailable().catch(() => false);
        
        if (!keycloakAvailable) {
          // Keycloak no disponible en desarrollo - generar token de prueba
          this.logger.warn('Keycloak no disponible, generando token de desarrollo');
          
          const user = {
            id: uuidv4(), // Usar UUID válido en lugar de timestamp
            email: loginDto.email,
            roles: ['cirujano', 'administrador'], // Roles de desarrollo
          };

          const tokens = await this.generateTokens(user);

          return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: this.configService.get<string>('auth.jwt.expiresIn') || '15m',
            requiresMfa: false,
            devMode: true, // Indicador de modo desarrollo
            user: {
              id: user.id,
              email: user.email,
              roles: user.roles,
              username: user.email, // Usar email como username para compatibilidad
            },
          };
        }
      }
      
      // Intentar autenticar con Keycloak
      try {
        const keycloakTokens = await this.keycloakService.authenticate(
          loginDto.email,
          loginDto.password,
        );

        // Obtener información del usuario
        const userInfo = await this.keycloakService.getUserInfo(keycloakTokens.access_token);
        const roles = this.keycloakService.getRolesFromUserInfo(userInfo);

        // Generar tokens JWT propios
        const user = {
          id: userInfo.sub,
          email: userInfo.email || userInfo.preferred_username,
          roles: roles,
        };

        const tokens = await this.generateTokens(user);

        return {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: this.configService.get<string>('auth.jwt.expiresIn') || '15m',
          requiresMfa: false,
          keycloakAccessToken: keycloakTokens.access_token,
          user: {
            id: user.id,
            email: user.email,
            roles: user.roles,
            username: userInfo.preferred_username || user.email,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
          },
        };
      } catch (keycloakError: any) {
        this.logger.error(`Error en autenticación Keycloak: ${keycloakError.message}`);
        
        // Si estamos en desarrollo y Keycloak falla, generar token de prueba
        if (isDevelopment) {
          this.logger.warn('Keycloak falló, generando token de desarrollo como fallback');
          
          const user = {
            id: uuidv4(), // Usar UUID válido
            email: loginDto.email,
            roles: ['cirujano', 'administrador'],
          };

          const tokens = await this.generateTokens(user);

          return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: this.configService.get<string>('auth.jwt.expiresIn') || '15m',
            requiresMfa: false,
            devMode: true,
            user: {
              id: user.id,
              email: user.email,
              roles: user.roles,
              username: user.email, // Usar email como username para compatibilidad
            },
          };
        }
        
        // En producción, lanzar el error
        throw new UnauthorizedException('Credenciales inválidas');
      }
    } catch (error) {
      this.logger.error(`Error en login: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  /**
   * Verifica código MFA y completa autenticación
   * Nota: Esto requiere que el usuario haya iniciado sesión primero
   */
  async verifyMfa(verifyMfaDto: VerifyMfaDto) {
    try {
      if (!verifyMfaDto.code || !verifyMfaDto.sessionToken) {
        throw new BadRequestException('Código MFA y token de sesión son requeridos');
      }

      // TODO: Implementar verificación MFA completa con Keycloak
      // Por ahora, retornamos error indicando que necesita implementación
      // La verificación MFA en Keycloak requiere el username/password original
      // y el código TOTP en la misma petición
      
      this.logger.warn('Verificación MFA requiere implementación completa con Keycloak');
      throw new BadRequestException('Verificación MFA no implementada completamente. Use login con código TOTP.');
    } catch (error) {
      this.logger.error(`Error en verificación MFA: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Código MFA inválido');
    }
  }

  /**
   * Refresca el access token usando refresh token
   * Puede usar refresh token de Keycloak o JWT propio
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      // Intentar refrescar con Keycloak primero
      try {
        const keycloakTokens = await this.keycloakService.refreshToken(refreshTokenDto.refreshToken);
        const userInfo = await this.keycloakService.getUserInfo(keycloakTokens.access_token);
        const roles = this.keycloakService.getRolesFromUserInfo(userInfo);

        const user = {
          id: userInfo.sub,
          email: userInfo.email || userInfo.preferred_username,
          roles: roles,
        };

        const tokens = await this.generateTokens(user);

        return {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: this.configService.get<string>('auth.jwt.expiresIn') || '15m',
        };
      } catch (keycloakError) {
        // Si falla con Keycloak, intentar con JWT propio
        this.logger.debug('Refresh token no es de Keycloak, intentando JWT propio');
      }

      // Fallback a JWT propio
      const jwtSecret = 
        this.configService.get<string>('auth.jwt.secret') || 
        this.configService.get<string>('JWT_SECRET') || 
        'change-this-secret-in-production-use-strong-secret-min-32-chars';
      
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: jwtSecret,
      });

      const user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles || [],
      };

      const tokens = await this.generateTokens(user);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: this.configService.get<string>('auth.jwt.expiresIn') || '15m',
      };
    } catch (error) {
      this.logger.error(`Error en refresh token: ${error.message}`, error.stack);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  /**
   * Genera access token y refresh token
   */
  private async generateTokens(user: { id: string; email: string; roles: string[] }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const jwtSecret = 
      this.configService.get<string>('auth.jwt.secret') || 
      this.configService.get<string>('JWT_SECRET') || 
      'change-this-secret-in-production-use-strong-secret-min-32-chars';
    
    const jwtExpiresIn = 
      this.configService.get<string>('auth.jwt.expiresIn') || 
      this.configService.get<string>('JWT_EXPIRATION') || 
      '15m';
    
    const jwtRefreshExpiresIn = 
      this.configService.get<string>('auth.jwt.refreshExpiresIn') || 
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || 
      '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtRefreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Valida token JWT
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const jwtSecret = 
        this.configService.get<string>('auth.jwt.secret') || 
        this.configService.get<string>('JWT_SECRET') || 
        'change-this-secret-in-production-use-strong-secret-min-32-chars';
      
      return this.jwtService.verify(token, {
        secret: jwtSecret,
      });
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Logout - invalida tokens en Keycloak
   */
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      try {
        await this.keycloakService.logout(refreshToken);
      } catch (error) {
        this.logger.warn(`Error invalidando token en Keycloak: ${error.message}`);
      }
    }
    this.logger.log(`Usuario ${userId} ha cerrado sesión`);
    return { message: 'Sesión cerrada correctamente' };
  }
}
