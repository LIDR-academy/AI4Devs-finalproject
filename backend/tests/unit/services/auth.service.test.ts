import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../../../src/services/auth.service';
import { User } from '../../../src/models/user.entity';
import { AuditLog } from '../../../src/models/audit-log.entity';
import { RegisterDto } from '../../../src/dto/auth/register.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
}));

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock de AppDataSource
jest.mock('../../../src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    isInitialized: true,
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let auditLogRepository: jest.Mocked<Repository<AuditLog>>;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(() => {
    // Crear mocks de repositorios
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    auditLogRepository = {
      save: jest.fn(),
    } as any;

    mockDataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === User) return userRepository;
        if (entity === AuditLog) return auditLogRepository;
        return null;
      }),
    } as any;

    // Configurar AppDataSource mock
    const { AppDataSource } = require('../../../src/config/database');
    AppDataSource.getRepository = mockDataSource.getRepository;
    const transactionalEntityManager = {
      findOne: jest.fn((entity, options) => {
        if (entity === User) {
          return userRepository.findOne(options);
        }
        return null;
      }),
      create: jest.fn((entity, payload) => {
        if (entity === User) {
          return userRepository.create(payload);
        }
        if (entity === AuditLog) {
          return payload;
        }
        return payload;
      }),
      save: jest.fn((entity, payload) => {
        if (entity === User) {
          return userRepository.save(payload);
        }
        if (entity === AuditLog) {
          return auditLogRepository.save(payload);
        }
        return Promise.resolve(payload);
      }),
    };
    AppDataSource.transaction = jest.fn(async (callback) =>
      callback(transactionalEntityManager)
    );

    authService = new AuthService();

    // Mock de reCAPTCHA por defecto
    mockedAxios.post.mockResolvedValue({
      data: {
        success: true,
        score: 0.9,
      },
    });

    // Mock de variables de entorno
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key';
    process.env.RECAPTCHA_THRESHOLD = '0.5';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'patient',
      recaptchaToken: 'valid-token',
    };

    it('debe crear un usuario exitosamente', async () => {
      // Mock: email no existe
      userRepository.findOne.mockResolvedValue(null);

      // Mock: usuario creado
      const savedUser = {
        id: 'user-id-123',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role,
        emailVerified: false,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      userRepository.create.mockReturnValue(savedUser as any);
      userRepository.save.mockResolvedValue(savedUser);

      // Mock: audit log guardado
      auditLogRepository.save.mockResolvedValue({
        id: 'log-id',
        action: 'register',
        entityType: 'user',
        entityId: savedUser.id,
        userId: savedUser.id,
        ipAddress: '192.168.1.1',
        timestamp: new Date(),
      } as AuditLog);

      // JWT ya está mockeado globalmente

      const result = await authService.register(registerDto, '192.168.1.1');

      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.firstName).toBe(registerDto.firstName);
      expect(result.user.lastName).toBe(registerDto.lastName);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(auditLogRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error si el email ya existe', async () => {
      // Mock: email ya existe
      userRepository.findOne.mockResolvedValue({
        id: 'existing-id',
        email: registerDto.email,
      } as User);

      await expect(
        authService.register(registerDto, '192.168.1.1')
      ).rejects.toThrow('Email ya está registrado');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar error si reCAPTCHA es inválido', async () => {
      // Mock: reCAPTCHA falla
      mockedAxios.post.mockResolvedValue({
        data: {
          success: false,
          score: 0.3,
        },
      });

      userRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.register(registerDto, '192.168.1.1')
      ).rejects.toThrow('reCAPTCHA inválido');

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('debe hashear la contraseña con bcrypt', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const savedUser = {
        id: 'user-id',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role,
        emailVerified: false,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      userRepository.create.mockReturnValue(savedUser as any);
      userRepository.save.mockResolvedValue(savedUser);
      auditLogRepository.save.mockResolvedValue({} as AuditLog);

      await authService.register(registerDto, '192.168.1.1');

      // Verificar que bcrypt.hash fue llamado con los parámetros correctos
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      
      // Verificar que el password guardado es el hasheado (no el original)
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed-password',
        })
      );
    });

    it('debe generar tokens JWT con la información correcta', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const savedUser = {
        id: 'user-id',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role,
        emailVerified: false,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      userRepository.create.mockReturnValue(savedUser as any);
      userRepository.save.mockResolvedValue(savedUser);
      auditLogRepository.save.mockResolvedValue({} as AuditLog);

      await authService.register(registerDto, '192.168.1.1');

      // Verificar que se llamó al menos dos veces (access y refresh token)
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      
      // Verificar que se llamó con los parámetros correctos para access token
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: savedUser.id,
          email: savedUser.email,
          role: savedUser.role,
        },
        'test-access-secret',
        expect.objectContaining({ expiresIn: '15m' })
      );

      // Verificar que se llamó con los parámetros correctos para refresh token
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: savedUser.id,
          type: 'refresh',
        },
        'test-refresh-secret',
        expect.objectContaining({ expiresIn: '7d' })
      );
    });
  });
});
