import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChangePasswordUseCase } from './change-password.usecase';
import {
  AUTH_REPOSITORY,
  IAuthRepository,
} from '../../domain/ports/auth-repository.port';
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from '../../domain/ports/session-repository.port';
import {
  AUDIT_REPOSITORY,
  IAuditRepository,
} from '../../domain/ports/audit-repository.port';
import { PasswordService } from '../../infrastructure/services/password.service';
import { PerfilModel } from '../../infrastructure/models/perfil.model';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { ValidationResult } from '../../domain/value-objects/validation-result.vo';
import { ChangePasswordRequestDto } from '../../infrastructure/dto/request/change-password.request.dto';
import { TokenPayload } from '../../infrastructure/services/jwt-token.service';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let mockAuthRepository: jest.Mocked<IAuthRepository>;
  let mockSessionRepository: jest.Mocked<ISessionRepository>;
  let mockAuditRepository: jest.Mocked<IAuditRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockPerfilRepo: any;

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

  const user: TokenPayload = {
    sub: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    username: 'jperez',
    empresaId: 1,
    oficinaId: 1,
    perfilId: 1,
    tipoUsuario: 'EMPLEADO',
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

    mockPerfilRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        {
          provide: AUTH_REPOSITORY,
          useValue: mockAuthRepository,
        },
        {
          provide: SESSION_REPOSITORY,
          useValue: mockSessionRepository,
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
          provide: getRepositoryToken(PerfilModel),
          useValue: mockPerfilRepo,
        },
      ],
    }).compile();

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
  });

  describe('execute', () => {
    const dto: ChangePasswordRequestDto = {
      currentPassword: 'oldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('debe lanzar BadRequestException si las contraseñas no coinciden', async () => {
      const dtoMismatch: ChangePasswordRequestDto = {
        ...dto,
        confirmPassword: 'DifferentPassword123!',
      };

      await expect(useCase.execute(dtoMismatch, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar UnauthorizedException si la contraseña actual es incorrecta', async () => {
      const usuario = crearUsuarioMock();
      mockAuthRepository.findById.mockResolvedValue(usuario);
      mockPasswordService.compare.mockResolvedValue(false);

      await expect(useCase.execute(dto, user)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'PASSWORD_CHANGE_FAILED',
          motivoError: 'Contraseña actual incorrecta',
        }),
      );
    });

    it('debe lanzar BadRequestException si la nueva contraseña no cumple la política', async () => {
      const usuario = crearUsuarioMock();
      mockAuthRepository.findById.mockResolvedValue(usuario);
      mockPasswordService.compare.mockResolvedValue(true);
      mockPerfilRepo.findOne.mockResolvedValue({ id: 1 });

      const validationResult = ValidationResult.invalid(
        'La contraseña debe tener al menos 8 caracteres',
      );
      mockPasswordService.validate.mockReturnValue(validationResult);

      await expect(useCase.execute(dto, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si la contraseña está en el historial', async () => {
      const usuario = crearUsuarioMock();
      mockAuthRepository.findById.mockResolvedValue(usuario);
      mockPasswordService.compare
        .mockResolvedValueOnce(true) // Contraseña actual correcta
        .mockResolvedValueOnce(true); // Nueva contraseña está en historial
      mockPerfilRepo.findOne.mockResolvedValue({ id: 1 });

      const validationResult = ValidationResult.valid();
      mockPasswordService.validate.mockReturnValue(validationResult);
      mockAuthRepository.getPasswordHistory.mockResolvedValue([
        '$2b$12$oldhash',
      ]);

      await expect(useCase.execute(dto, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe cambiar la contraseña exitosamente', async () => {
      const usuario = crearUsuarioMock();
      mockAuthRepository.findById.mockResolvedValue(usuario);
      mockPasswordService.compare
        .mockResolvedValueOnce(true) // Contraseña actual correcta
        .mockResolvedValueOnce(false); // Nueva contraseña no está en historial
      mockPerfilRepo.findOne.mockResolvedValue({ id: 1 });

      const validationResult = ValidationResult.valid();
      mockPasswordService.validate.mockReturnValue(validationResult);
      mockAuthRepository.getPasswordHistory.mockResolvedValue([]);
      mockPasswordService.hash.mockResolvedValue('$2b$12$newhash');

      await useCase.execute(dto, user);

      expect(mockAuthRepository.savePasswordHistory).toHaveBeenCalled();
      expect(mockAuthRepository.updatePassword).toHaveBeenCalled();
      expect(mockSessionRepository.revokeAllByUserId).toHaveBeenCalled();
      expect(mockAuditRepository.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoEvento: 'PASSWORD_CHANGE',
          exito: true,
        }),
      );
    });
  });
});

