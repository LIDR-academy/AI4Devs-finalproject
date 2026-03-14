import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../../../src/services/auth.service';
import { User } from '../../../src/models/user.entity';
import { Doctor } from '../../../src/models/doctor.entity';
import { AuditLog } from '../../../src/models/audit-log.entity';
import { RegisterDoctorDto } from '../../../src/dto/auth/register-doctor.dto';
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

describe('AuthService - registerDoctor', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let doctorRepository: jest.Mocked<Repository<Doctor>>;
  let auditLogRepository: jest.Mocked<Repository<AuditLog>>;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(() => {
    // Crear mocks de repositorios
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    doctorRepository = {
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    auditLogRepository = {
      save: jest.fn(),
    } as any;

    mockDataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === User) return userRepository;
        if (entity === Doctor) return doctorRepository;
        if (entity === AuditLog) return auditLogRepository;
        return null;
      }),
    } as any;

    // Configurar AppDataSource mock
    const { AppDataSource } = require('../../../src/config/database');
    AppDataSource.getRepository = mockDataSource.getRepository;

    authService = new AuthService();

    // Mock de reCAPTCHA por defecto
    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes('recaptcha')) {
        return Promise.resolve({
          data: {
            success: true,
            score: 0.9,
          },
        });
      }
      return Promise.reject(new Error('Unexpected axios call'));
    });

    // Mock de geocodificación por defecto
    mockedAxios.get.mockResolvedValue({
      data: {
        status: 'OK',
        results: [
          {
            geometry: {
              location: {
                lat: 19.4326,
                lng: -99.1332,
              },
            },
          },
        ],
      },
    });

    // Mock de variables de entorno
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key';
    process.env.RECAPTCHA_THRESHOLD = '0.5';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.GOOGLE_MAPS_API_KEY = 'test-google-maps-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerDoctor', () => {
    const registerDoctorDto: RegisterDoctorDto = {
      email: 'doctor@example.com',
      password: 'password123',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'doctor',
      address: 'Av. Reforma 123, Col. Centro',
      postalCode: '06000',
      bio: 'Médico especialista en cardiología',
      phone: '+525512345678',
      recaptchaToken: 'valid-token',
    };

    it('debe crear un médico exitosamente con geocodificación', async () => {
      // Mock: email no existe
      userRepository.findOne.mockResolvedValue(null);

      // Mock: usuario creado
      const savedUser = {
        id: 'user-id-123',
        email: registerDoctorDto.email,
        firstName: registerDoctorDto.firstName,
        lastName: registerDoctorDto.lastName,
        role: 'doctor' as const,
        emailVerified: false,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      // Mock: doctor creado
      const savedDoctor = {
        id: 'doctor-id-123',
        userId: savedUser.id,
        user: savedUser,
        address: registerDoctorDto.address,
        postalCode: registerDoctorDto.postalCode,
        latitude: 19.4326,
        longitude: -99.1332,
        bio: registerDoctorDto.bio,
        verificationStatus: 'pending' as const,
        ratingAverage: 0.0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Doctor;

      userRepository.create.mockReturnValue(savedUser as any);
      userRepository.save.mockResolvedValue(savedUser);
      doctorRepository.create.mockReturnValue(savedDoctor as any);
      doctorRepository.save.mockResolvedValue(savedDoctor);

      // Mock: audit logs guardados
      auditLogRepository.save.mockResolvedValue({} as AuditLog);

      const result = await authService.registerDoctor(registerDoctorDto, '192.168.1.1');

      expect(result.user.email).toBe(registerDoctorDto.email);
      expect(result.user.role).toBe('doctor');
      expect(result.doctor).toBeDefined();
      expect(result.doctor?.verificationStatus).toBe('pending');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      // Verificar que se llamó a geocodificación
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://maps.googleapis.com/maps/api/geocode/json',
        expect.objectContaining({
          params: expect.objectContaining({
            address: expect.stringContaining(registerDoctorDto.address),
            key: 'test-google-maps-key',
          }),
        })
      );

      // Verificar que se creó el doctor con coordenadas
      expect(doctorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          address: registerDoctorDto.address,
          postalCode: registerDoctorDto.postalCode,
          latitude: 19.4326,
          longitude: -99.1332,
          bio: registerDoctorDto.bio,
          verificationStatus: 'pending',
        })
      );

      // Verificar que se guardaron dos audit logs (usuario y médico)
      expect(auditLogRepository.save).toHaveBeenCalledTimes(2);
    });

    it('debe crear un médico sin coordenadas si falla la geocodificación', async () => {
      // Mock: geocodificación falla
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'ZERO_RESULTS',
          results: [],
        },
      });

      userRepository.findOne.mockResolvedValue(null);

      const savedUser = {
        id: 'user-id',
        email: registerDoctorDto.email,
        firstName: registerDoctorDto.firstName,
        lastName: registerDoctorDto.lastName,
        role: 'doctor' as const,
        emailVerified: false,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const savedDoctor = {
        id: 'doctor-id',
        userId: savedUser.id,
        user: savedUser,
        address: registerDoctorDto.address,
        postalCode: registerDoctorDto.postalCode,
        latitude: undefined,
        longitude: undefined,
        bio: registerDoctorDto.bio,
        verificationStatus: 'pending' as const,
        ratingAverage: 0.0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Doctor;

      userRepository.create.mockReturnValue(savedUser as any);
      userRepository.save.mockResolvedValue(savedUser);
      doctorRepository.create.mockReturnValue(savedDoctor as any);
      doctorRepository.save.mockResolvedValue(savedDoctor);
      auditLogRepository.save.mockResolvedValue({} as AuditLog);

      const result = await authService.registerDoctor(registerDoctorDto, '192.168.1.1');

      expect(result.user).toBeDefined();
      expect(result.doctor).toBeDefined();

      // Verificar que se creó el doctor sin coordenadas
      expect(doctorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: undefined,
          longitude: undefined,
        })
      );
    });

    it('debe usar coordenadas del DTO si están presentes', async () => {
      const dtoWithCoordinates: RegisterDoctorDto = {
        ...registerDoctorDto,
        latitude: 20.1234,
        longitude: -100.5678,
      };

      userRepository.findOne.mockResolvedValue(null);

      const savedUser = {
        id: 'user-id',
        email: dtoWithCoordinates.email,
        firstName: dtoWithCoordinates.firstName,
        lastName: dtoWithCoordinates.lastName,
        role: 'doctor' as const,
        emailVerified: false,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const savedDoctor = {
        id: 'doctor-id',
        userId: savedUser.id,
        user: savedUser,
        address: dtoWithCoordinates.address,
        postalCode: dtoWithCoordinates.postalCode,
        latitude: dtoWithCoordinates.latitude,
        longitude: dtoWithCoordinates.longitude,
        bio: dtoWithCoordinates.bio,
        verificationStatus: 'pending' as const,
        ratingAverage: 0.0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Doctor;

      userRepository.create.mockReturnValue(savedUser as any);
      userRepository.save.mockResolvedValue(savedUser);
      doctorRepository.create.mockReturnValue(savedDoctor as any);
      doctorRepository.save.mockResolvedValue(savedDoctor);
      auditLogRepository.save.mockResolvedValue({} as AuditLog);

      await authService.registerDoctor(dtoWithCoordinates, '192.168.1.1');

      // Verificar que NO se llamó a geocodificación (usa coordenadas del DTO)
      expect(mockedAxios.get).not.toHaveBeenCalled();

      // Verificar que se usaron las coordenadas del DTO
      expect(doctorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 20.1234,
          longitude: -100.5678,
        })
      );
    });

    it('debe lanzar error si el email ya existe', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'existing-id',
        email: registerDoctorDto.email,
      } as User);

      await expect(
        authService.registerDoctor(registerDoctorDto, '192.168.1.1')
      ).rejects.toThrow('Email ya está registrado');

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(doctorRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar error si reCAPTCHA es inválido', async () => {
      mockedAxios.post.mockImplementation((url: string) => {
        if (url.includes('recaptcha')) {
          return Promise.resolve({
            data: {
              success: false,
              score: 0.3,
            },
          });
        }
        return Promise.reject(new Error('Unexpected axios call'));
      });

      userRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.registerDoctor(registerDoctorDto, '192.168.1.1')
      ).rejects.toThrow('reCAPTCHA inválido');

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(doctorRepository.save).not.toHaveBeenCalled();
    });

    it('debe crear el usuario con role="doctor"', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const savedUser = {
        id: 'user-id',
        email: registerDoctorDto.email,
        firstName: registerDoctorDto.firstName,
        lastName: registerDoctorDto.lastName,
        role: 'doctor' as const,
        emailVerified: false,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const savedDoctor = {
        id: 'doctor-id',
        userId: savedUser.id,
        user: savedUser,
        address: registerDoctorDto.address,
        postalCode: registerDoctorDto.postalCode,
        latitude: 19.4326,
        longitude: -99.1332,
        bio: registerDoctorDto.bio,
        verificationStatus: 'pending' as const,
        ratingAverage: 0.0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Doctor;

      userRepository.create.mockReturnValue(savedUser as any);
      userRepository.save.mockResolvedValue(savedUser);
      doctorRepository.create.mockReturnValue(savedDoctor as any);
      doctorRepository.save.mockResolvedValue(savedDoctor);
      auditLogRepository.save.mockResolvedValue({} as AuditLog);

      await authService.registerDoctor(registerDoctorDto, '192.168.1.1');

      // Verificar que el usuario se creó con role="doctor"
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'doctor',
        })
      );
    });

    it('debe crear el doctor con verification_status="pending"', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const savedUser = {
        id: 'user-id',
        email: registerDoctorDto.email,
        firstName: registerDoctorDto.firstName,
        lastName: registerDoctorDto.lastName,
        role: 'doctor' as const,
        emailVerified: false,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const savedDoctor = {
        id: 'doctor-id',
        userId: savedUser.id,
        user: savedUser,
        address: registerDoctorDto.address,
        postalCode: registerDoctorDto.postalCode,
        latitude: 19.4326,
        longitude: -99.1332,
        bio: registerDoctorDto.bio,
        verificationStatus: 'pending' as const,
        ratingAverage: 0.0,
        totalReviews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Doctor;

      userRepository.create.mockReturnValue(savedUser as any);
      userRepository.save.mockResolvedValue(savedUser);
      doctorRepository.create.mockReturnValue(savedDoctor as any);
      doctorRepository.save.mockResolvedValue(savedDoctor);
      auditLogRepository.save.mockResolvedValue({} as AuditLog);

      await authService.registerDoctor(registerDoctorDto, '192.168.1.1');

      // Verificar que el doctor se creó con verification_status="pending"
      expect(doctorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          verificationStatus: 'pending',
        })
      );
    });
  });
});
