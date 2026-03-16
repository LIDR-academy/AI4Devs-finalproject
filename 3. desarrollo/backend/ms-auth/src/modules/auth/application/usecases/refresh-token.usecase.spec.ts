import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from '../../domain/ports/session-repository.port';
import {
  AUTH_REPOSITORY,
  IAuthRepository,
} from '../../domain/ports/auth-repository.port';
import {
  AUDIT_REPOSITORY,
  IAuditRepository,
} from '../../domain/ports/audit-repository.port';
import { JwtTokenService } from '../../infrastructure/services/jwt-token.service';
import { PerfilModel } from '../../infrastructure/models/perfil.model';
import { SesionEntity } from '../../domain/entities/sesion.entity';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { RefreshTokenRequestDto } from '../../infrastructure/dto/request/refresh-token.request.dto';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let mockSessionRepository: jest.Mocked<ISessionRepository>;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let mockAuditRepository: jest.Mocked<IAuditRepository>;
  let mockJwtTokenService: jest.Mocked<JwtTokenService>;
  let mockPerfilRepo: any;

  const crearSesionMock = (): SesionEntity => {
    return new SesionEntity(
      1,
      'session-uuid',
      1,
      'hashed-token',
      'token-family',
      '192.168.1.1',
      'Mozilla/5.0',
      null,
      null,
      true,
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      new Date(),
      null,
      null,
    );
  };

  const crearUsuarioMock = (): UsuarioEntity => {
    return new UsuarioEntity(
      1,
      '550e8400-e29b-41d4-a716-446655440000',
      'jperez',
      'Juan Pérez',
      'jperez@ejemplo.com',
      '$2b$12$hashedpassword',
      1,
      1,
      1,
      null,
      'EMPLEADO',
      false,
      false,
      new Date(),
      false,
      false,
      0,
      null,
      null,
      null,
      null,
      null,
      false,
      null,
      true,
      false,
      null,
    );
  };

  beforeEach(async () => {
    mockSessionRepository = {
      create: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      findByUuid: jest.fn(),
      findActiveByUserId: jest.fn(),
      updateActivity: jest.fn(),
      updateRefreshToken: jest.fn(),
      revoke: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };

    mockAuthRepository = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUuid: jest.fn(),
      updateLastLogin: jest.fn(),
      incrementFailedAttempts: jest.fn(),
      resetFailedAttempts: jest.fn(),
      lockUser: jest.fn(),
      unlockUser: jest.fn(),
      updatePassword: jest.fn(),
      getPasswordHistory: jest.fn(),
      savePasswordHistory: jest.fn(),
    };

    mockAuditRepository = {
      log: jest.fn(),
    };

    mockJwtTokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      hashRefreshToken: jest.fn(),
    };

    mockPerfilRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: SESSION_REPOSITORY,
          useValue: mockSessionRepository,
        },
        {
          provide: AUTH_REPOSITORY,
          useValue: mockAuthRepository,
        },
        {
          provide: AUDIT_REPOSITORY,
          useValue: mockAuditRepository,
        },
        {
          provide: JwtTokenService,
          useValue: mockJwtTokenService,
        },
        {
          provide: getRepositoryToken(PerfilModel),
          useValue: mockPerfilRepo,
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  describe('execute', () => {
    const refreshDto: RefreshTokenRequestDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('debe lanzar UnauthorizedException si el token es inválido', async () => {
      mockJwtTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new UnauthorizedException('Token inválido');
      });

      await expect(useCase.execute(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'TOKEN_REFRESH_FAILED',
          exito: false,
        }),
      );
    });

    it('debe lanzar UnauthorizedException si la sesión no existe', async () => {
      mockJwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: 1,
        sessionId: 'session-uuid',
        family: 'token-family',
      } as any);
      mockJwtTokenService.hashRefreshToken.mockReturnValue('hashed-token');
      mockSessionRepository.findByRefreshTokenHash.mockResolvedValue(null);

      await expect(useCase.execute(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe detectar token reuse y revocar todas las sesiones', async () => {
      const sesion = crearSesionMock();
      sesion.tokenFamily = 'different-family';

      mockJwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: 1,
        sessionId: 'session-uuid',
        family: 'token-family',
      } as any);
      mockJwtTokenService.hashRefreshToken.mockReturnValue('hashed-token');
      mockSessionRepository.findByRefreshTokenHash.mockResolvedValue(sesion);

      await expect(useCase.execute(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockSessionRepository.revokeAllByUserId).toHaveBeenCalledWith(
        1,
        'TOKEN_REUSE',
      );
      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'TOKEN_REUSE_DETECTED',
        }),
      );
    });

    it('debe retornar nuevos tokens cuando el refresh es exitoso', async () => {
      const sesion = crearSesionMock();
      const usuario = crearUsuarioMock();

      mockJwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: 1,
        sessionId: 'session-uuid',
        family: 'token-family',
      } as any);
      mockJwtTokenService.hashRefreshToken.mockReturnValue('hashed-token');
      mockSessionRepository.findByRefreshTokenHash.mockResolvedValue(sesion);
      mockAuthRepository.findById.mockResolvedValue(usuario);
      mockPerfilRepo.findOne.mockResolvedValue({ id: 1 });

      mockJwtTokenService.generateRefreshToken.mockReturnValue('new-refresh');
      mockJwtTokenService.hashRefreshToken.mockReturnValue('new-hashed');
      mockJwtTokenService.generateAccessToken.mockReturnValue('new-access');

      const result = await useCase.execute(refreshDto);

      expect(result).toHaveProperty('accessToken', 'new-access');
      expect(result).toHaveProperty('refreshToken', 'new-refresh');
      expect(mockSessionRepository.updateRefreshToken).toHaveBeenCalled();
      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'TOKEN_REFRESH',
          exito: true,
        }),
      );
    });
  });
});

