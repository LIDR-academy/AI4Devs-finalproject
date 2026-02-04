import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { KeycloakService } from './services/keycloak.service';
import { LoginDto } from './dto/login.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        'auth.jwt.secret': 'test-secret',
        'auth.jwt.expiresIn': '15m',
        'auth.jwt.refreshExpiresIn': '7d',
        'auth.keycloak.baseUrl': 'http://localhost:8080',
        'auth.keycloak.realm': 'sistema-quirurgico',
      };
      return config[key];
    }),
  };

  const mockKeycloakService = {
    isAvailable: jest.fn().mockResolvedValue(false),
    authenticate: jest.fn(),
    getUserInfo: jest.fn(),
    getRolesFromUserInfo: jest.fn(),
    verifyMfa: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService.get.mockImplementation((key: string) => {
      const config: Record<string, any> = {
        'auth.jwt.secret': 'test-secret',
        'auth.jwt.expiresIn': '15m',
        'auth.jwt.refreshExpiresIn': '7d',
        'auth.keycloak.baseUrl': 'http://localhost:8080',
        'auth.keycloak.realm': 'sistema-quirurgico',
        NODE_ENV: 'development',
      };
      return config[key];
    });
    mockKeycloakService.isAvailable.mockResolvedValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: KeycloakService,
          useValue: mockKeycloakService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('debería lanzar BadRequestException si faltan credenciales', async () => {
      const loginDto: LoginDto = {
        email: '',
        password: '',
      };

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('debería generar tokens al hacer login exitoso', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyMfa', () => {
    it('debería lanzar BadRequestException si faltan datos', async () => {
      const verifyMfaDto: VerifyMfaDto = {
        code: '',
        sessionToken: '',
      };

      await expect(service.verifyMfa(verifyMfaDto)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException cuando MFA no está implementado', async () => {
      const verifyMfaDto: VerifyMfaDto = {
        code: '123456',
        sessionToken: 'session-token',
      };

      await expect(service.verifyMfa(verifyMfaDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshToken', () => {
    it('debería lanzar UnauthorizedException si el token es inválido', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-token',
      };

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('debería generar nuevos tokens con refresh token válido', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        roles: ['cirujano'],
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockJwtService.signAsync.mockResolvedValueOnce('new-access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('new-refresh-token');

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken, {
        secret: 'test-secret',
      });
    });
  });

  describe('validateToken', () => {
    it('debería validar token correctamente', async () => {
      const token = 'valid-token';
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        roles: ['cirujano'],
      };

      mockJwtService.verify.mockReturnValue(payload);

      const result = await service.validateToken(token);

      expect(result).toEqual(payload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'test-secret',
      });
    });

    it('debería lanzar UnauthorizedException si el token es inválido', async () => {
      const token = 'invalid-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken(token)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('debería cerrar sesión correctamente', async () => {
      const userId = 'user-id';

      const result = await service.logout(userId);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Sesión cerrada correctamente');
    });
  });
});
