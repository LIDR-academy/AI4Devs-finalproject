import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoginUseCase } from './login.usecase';
import {
  AUTH_REPOSITORY,
  IAuthRepository,
} from '../../domain/ports/auth-repository.port';
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from '../../domain/ports/session-repository.port';
import {
  SCHEDULE_REPOSITORY,
  IScheduleRepository,
} from '../../domain/ports/schedule-repository.port';
import {
  AUDIT_REPOSITORY,
  IAuditRepository,
} from '../../domain/ports/audit-repository.port';
import { PasswordService } from '../../infrastructure/services/password.service';
import { JwtTokenService } from '../../infrastructure/services/jwt-token.service';
import { ScheduleService } from '../../infrastructure/services/schedule.service';
import { PerfilModel } from '../../infrastructure/models/perfil.model';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { PerfilEntity } from '../../domain/entities/perfil.entity';
import { ScheduleCheckResult } from '../../domain/value-objects/schedule-check-result.vo';
import { LoginRequestDto } from '../../infrastructure/dto/request/login.request.dto';
import { ClientInfo } from '../../infrastructure/interfaces/client-info.interface';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let mockSessionRepository: jest.Mocked<ISessionRepository>;
  let mockScheduleRepository: jest.Mocked<IScheduleRepository>;
  let mockAuditRepository: jest.Mocked<IAuditRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockJwtTokenService: jest.Mocked<JwtTokenService>;
  let mockScheduleService: jest.Mocked<ScheduleService>;
  let mockPerfilRepo: any;

  const mockClientInfo: ClientInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
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

  const crearPerfilMock = (): PerfilEntity => {
    return new PerfilEntity(
      1,
      'Empleado',
      'Perfil de empleado',
      15,
      7,
      8,
      128,
      true,
      true,
      true,
      true,
      90,
      5,
      5,
      30,
      15,
      true,
      30,
      false,
      true,
      false,
      new Date(),
      new Date(),
    );
  };

  beforeEach(async () => {
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

    mockScheduleRepository = {
      findUserSchedule: jest.fn(),
      findTemporaryAuth: jest.fn(),
    };

    mockAuditRepository = {
      log: jest.fn(),
    };

    mockPasswordService = {
      hash: jest.fn(),
      compare: jest.fn(),
      validate: jest.fn(),
      generateResetToken: jest.fn(),
      hashResetToken: jest.fn(),
    };

    mockJwtTokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      hashRefreshToken: jest.fn(),
    };

    mockScheduleService = {
      canUserAccessNow: jest.fn(),
    };

    mockPerfilRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: AUTH_REPOSITORY,
          useValue: mockAuthRepository,
        },
        {
          provide: SESSION_REPOSITORY,
          useValue: mockSessionRepository,
        },
        {
          provide: SCHEDULE_REPOSITORY,
          useValue: mockScheduleRepository,
        },
        {
          provide: AUDIT_REPOSITORY,
          useValue: mockAuditRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: JwtTokenService,
          useValue: mockJwtTokenService,
        },
        {
          provide: ScheduleService,
          useValue: mockScheduleService,
        },
        {
          provide: getRepositoryToken(PerfilModel),
          useValue: mockPerfilRepo,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  describe('execute', () => {
    const loginDto: LoginRequestDto = {
      username: 'jperez',
      password: 'password123',
    };

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      mockAuthRepository.findByUsername.mockResolvedValue(null);

      await expect(
        useCase.execute(loginDto, mockClientInfo),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'LOGIN_FAILED',
          nombreUsuario: 'jperez',
          exito: false,
        }),
      );
    });

    it('debe lanzar UnauthorizedException si el usuario está inactivo', async () => {
      const usuario = crearUsuarioMock();
      usuario.activo = false;
      mockAuthRepository.findByUsername.mockResolvedValue(usuario);

      await expect(
        useCase.execute(loginDto, mockClientInfo),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'LOGIN_FAILED',
          motivoError: 'Usuario inactivo',
        }),
      );
    });

    it('debe lanzar UnauthorizedException si el usuario está bloqueado', async () => {
      const usuario = crearUsuarioMock();
      usuario.bloqueadoHasta = new Date(Date.now() + 30 * 60000); // 30 min en el futuro
      mockAuthRepository.findByUsername.mockResolvedValue(usuario);

      await expect(
        useCase.execute(loginDto, mockClientInfo),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'LOGIN_BLOCKED',
        }),
      );
    });

    it('debe lanzar UnauthorizedException si está fuera del horario (usuario no SISTEMA)', async () => {
      const usuario = crearUsuarioMock();
      mockAuthRepository.findByUsername.mockResolvedValue(usuario);
      mockScheduleService.canUserAccessNow.mockResolvedValue(
        ScheduleCheckResult.denied('Fuera de horario', '08:00', '17:00'),
      );

      const perfil = crearPerfilMock();
      mockPerfilRepo.findOne.mockResolvedValue({ id: 1 });

      await expect(
        useCase.execute(loginDto, mockClientInfo),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuthRepository.incrementFailedAttempts).toHaveBeenCalled();
    });

    it('debe permitir acceso a usuarios SISTEMA sin verificar horario', async () => {
      const usuario = crearUsuarioMock();
      usuario.tipoUsuario = 'SISTEMA';
      mockAuthRepository.findByUsername.mockResolvedValue(usuario);
      mockPasswordService.compare.mockResolvedValue(true);

      const perfil = crearPerfilMock();
      mockPerfilRepo.findOne.mockResolvedValue({ id: 1 });

      mockJwtTokenService.generateRefreshToken.mockReturnValue('refresh-token');
      mockJwtTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');
      mockJwtTokenService.generateAccessToken.mockReturnValue('access-token');
      mockSessionRepository.create.mockResolvedValue({
        id: 1,
        uuid: 'session-uuid',
        usuarioId: 1,
        refreshTokenHash: 'hashed',
        tokenFamily: 'family',
        ipLogin: '192.168.1.1',
        userAgent: null,
        deviceFingerprint: null,
        deviceName: null,
        activo: true,
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(),
        fechaUltimaActividad: new Date(),
        fechaRevocacion: null,
        motivoRevocacion: null,
      } as any);

      const result = await useCase.execute(loginDto, mockClientInfo);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockScheduleService.canUserAccessNow).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const usuario = crearUsuarioMock();
      mockAuthRepository.findByUsername.mockResolvedValue(usuario);
      mockPasswordService.compare.mockResolvedValue(false);
      mockAuthRepository.incrementFailedAttempts.mockResolvedValue(1);

      const perfil = crearPerfilMock();
      mockPerfilRepo.findOne.mockResolvedValue({ id: 1 });

      mockScheduleService.canUserAccessNow.mockResolvedValue(
        ScheduleCheckResult.allowed(),
      );

      await expect(
        useCase.execute(loginDto, mockClientInfo),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuthRepository.incrementFailedAttempts).toHaveBeenCalled();
      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'LOGIN_FAILED',
          motivoError: 'Contraseña incorrecta',
        }),
      );
    });

    it('debe bloquear usuario después de máximo intentos fallidos', async () => {
      const usuario = crearUsuarioMock();
      usuario.intentosFallidos = 4;
      usuario.fechaPrimerIntentoFallido = new Date();
      mockAuthRepository.findByUsername.mockResolvedValue(usuario);
      mockPasswordService.compare.mockResolvedValue(false);
      mockAuthRepository.incrementFailedAttempts.mockResolvedValue(5);

      const perfil = crearPerfilMock();
      mockPerfilRepo.findOne.mockResolvedValue({ id: 1 });

      mockScheduleService.canUserAccessNow.mockResolvedValue(
        ScheduleCheckResult.allowed(),
      );

      await expect(
        useCase.execute(loginDto, mockClientInfo),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuthRepository.lockUser).toHaveBeenCalled();
      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'ACCOUNT_LOCKED',
        }),
      );
    });

    it('debe retornar tokens cuando el login es exitoso', async () => {
      const usuario = crearUsuarioMock();
      mockAuthRepository.findByUsername.mockResolvedValue(usuario);
      mockPasswordService.compare.mockResolvedValue(true);
      mockScheduleService.canUserAccessNow.mockResolvedValue(
        ScheduleCheckResult.allowed(),
      );

      const perfil = crearPerfilMock();
      mockPerfilRepo.findOne.mockResolvedValue({ id: 1 });

      mockJwtTokenService.generateRefreshToken.mockReturnValue('refresh-token');
      mockJwtTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');
      mockJwtTokenService.generateAccessToken.mockReturnValue('access-token');
      mockSessionRepository.create.mockResolvedValue({
        id: 1,
        uuid: 'session-uuid',
        usuarioId: 1,
        refreshTokenHash: 'hashed',
        tokenFamily: 'family',
        ipLogin: '192.168.1.1',
        userAgent: null,
        deviceFingerprint: null,
        deviceName: null,
        activo: true,
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(),
        fechaUltimaActividad: new Date(),
        fechaRevocacion: null,
        motivoRevocacion: null,
      } as any);

      const result = await useCase.execute(loginDto, mockClientInfo);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result).toHaveProperty('user');
      expect(result.user.username).toBe('jperez');
      expect(mockAuthRepository.updateLastLogin).toHaveBeenCalled();
      expect(mockAuthRepository.resetFailedAttempts).toHaveBeenCalled();
      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'LOGIN_SUCCESS',
          exito: true,
        }),
      );
    });

    it('debe revocar otras sesiones si el perfil requiere sesión única', async () => {
      const usuario = crearUsuarioMock();
      mockAuthRepository.findByUsername.mockResolvedValue(usuario);
      mockPasswordService.compare.mockResolvedValue(true);
      mockScheduleService.canUserAccessNow.mockResolvedValue(
        ScheduleCheckResult.allowed(),
      );

      const perfil = crearPerfilMock();
      perfil.sesionUnica = true;
      mockPerfilRepo.findOne.mockResolvedValue({ id: 1 });

      mockJwtTokenService.generateRefreshToken.mockReturnValue('refresh-token');
      mockJwtTokenService.hashRefreshToken.mockReturnValue('hashed-refresh');
      mockJwtTokenService.generateAccessToken.mockReturnValue('access-token');
      mockSessionRepository.create.mockResolvedValue({
        id: 1,
        uuid: 'session-uuid',
        usuarioId: 1,
        refreshTokenHash: 'hashed',
        tokenFamily: 'family',
        ipLogin: '192.168.1.1',
        userAgent: null,
        deviceFingerprint: null,
        deviceName: null,
        activo: true,
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(),
        fechaUltimaActividad: new Date(),
        fechaRevocacion: null,
        motivoRevocacion: null,
      } as any);

      await useCase.execute(loginDto, mockClientInfo);

      expect(mockSessionRepository.revokeAllByUserId).toHaveBeenCalledWith(
        1,
        'NEW_SESSION',
      );
    });
  });
});

