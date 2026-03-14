import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AppDataSource } from '../../../src/config/database';
import { errorHandler } from '../../../src/middleware/error-handler.middleware';
import authRoutes from '../../../src/routes/auth.routes';
import { clearTestDatabase } from '../../setup/test-db';
import axios from 'axios';
import { Doctor } from '../../../src/models/doctor.entity';
import { User } from '../../../src/models/user.entity';

// Mock de axios para reCAPTCHA y geocodificación
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthController - Register Doctor (Integration)', () => {
  let app: Express;

  function createTestApp(): Express {
    const testApp = express();
    testApp.use(cors());
    testApp.use(express.json());
    testApp.use(express.urlencoded({ extended: true }));
    testApp.use(cookieParser());
    testApp.set('trust proxy', 1);

    // Rutas
    testApp.use('/api/v1/auth', authRoutes);

    // Manejo de errores
    testApp.use(errorHandler);

    return testApp;
  }

  beforeAll(async () => {
    // Configurar variables de entorno para testing
    process.env.DB_HOST = process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost';
    process.env.DB_PORT = process.env.TEST_DB_PORT || process.env.DB_PORT || '3306';
    process.env.DB_USER = process.env.TEST_DB_USER || process.env.DB_USER || 'citaya_user';
    process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || 'citaya_password_dev';
    process.env.DB_NAME = process.env.TEST_DB_NAME || 'citaya_test';

    // Inicializar base de datos si no está inicializada
    if (!AppDataSource.isInitialized) {
      try {
        await AppDataSource.initialize();
        // Ejecutar migraciones para asegurar que las tablas existan
        await AppDataSource.runMigrations();
      } catch (error) {
        console.error('Error inicializando base de datos en tests:', error);
        throw error;
      }
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Crear nueva instancia de app para cada test
    app = createTestApp();

    // Limpiar base de datos antes de cada test
    await clearTestDatabase(AppDataSource);

    // Mock de reCAPTCHA por defecto (éxito)
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

    // Mock de geocodificación por defecto (éxito)
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

    // Configurar variables de entorno para testing
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key';
    process.env.RECAPTCHA_THRESHOLD = '0.5';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.GOOGLE_MAPS_API_KEY = 'test-google-maps-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register - Doctor Registration', () => {
    const getValidDoctorRegisterDto = (emailSuffix = '') => ({
      email: `doctor${emailSuffix}@example.com`,
      password: 'password123',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'doctor' as const,
      address: 'Av. Reforma 123, Col. Centro',
      postalCode: '06000',
      bio: 'Médico especialista en cardiología',
      phone: '+525512345678',
      recaptchaToken: 'valid-token',
    });

    const getUniqueIp = (suffix: number) => `192.168.1.${suffix}`;

    it('debe registrar un médico exitosamente con geocodificación', async () => {
      const registerDto = getValidDoctorRegisterDto('-success');

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(1))
        .send(registerDto)
        .expect(201);

      // Verificar respuesta
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user.firstName).toBe(registerDto.firstName);
      expect(response.body.user.lastName).toBe(registerDto.lastName);
      expect(response.body.user.role).toBe('doctor');
      expect(response.body.user.emailVerified).toBe(false);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.doctor).toBeDefined();
      expect(response.body.doctor.verificationStatus).toBe('pending');

      // Verificar que se creó en la base de datos
      // La transacción ya se completó cuando recibimos la respuesta 201
      const userRepository = AppDataSource.getRepository(User);
      const doctorRepository = AppDataSource.getRepository(Doctor);

      // Leer el usuario usando findOne para verificar el mapeo de TypeORM
      const savedUser = await userRepository.findOne({
        where: { email: registerDto.email },
      });
      expect(savedUser).toBeDefined();
      expect(savedUser?.role).toBe('doctor');

      const savedDoctor = await doctorRepository.findOne({
        where: { userId: savedUser!.id },
      });
      expect(savedDoctor).toBeDefined();
      expect(savedDoctor?.address).toBe(registerDto.address);
      expect(savedDoctor?.postalCode).toBe(registerDto.postalCode);
      expect(savedDoctor?.verificationStatus).toBe('pending');
      expect(savedDoctor?.latitude).toBeCloseTo(19.4326, 4);
      expect(savedDoctor?.longitude).toBeCloseTo(-99.1332, 4);
      expect(savedDoctor?.bio).toBe(registerDto.bio);
    });

    it('debe registrar un médico sin coordenadas si falla la geocodificación', async () => {
      // Mock: geocodificación falla
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'ZERO_RESULTS',
          results: [],
        },
      });

      const registerDto = getValidDoctorRegisterDto('-no-geocode');

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(2))
        .send(registerDto)
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.doctor).toBeDefined();

      // Verificar que se guardó sin coordenadas
      const userRepository = AppDataSource.getRepository(User);
      const doctorRepository = AppDataSource.getRepository(Doctor);

      const savedUser = await userRepository.findOne({
        where: { email: registerDto.email },
      });
      const savedDoctor = await doctorRepository.findOne({
        where: { userId: savedUser!.id },
      });

      expect(savedDoctor?.latitude).toBeNull();
      expect(savedDoctor?.longitude).toBeNull();
      expect(savedDoctor?.address).toBe(registerDto.address);
    });

    it('debe retornar 400 si faltan campos obligatorios (address)', async () => {
      const invalidDto = {
        email: 'doctor@example.com',
        password: 'password123',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'doctor',
        postalCode: '06000',
        recaptchaToken: 'valid-token',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(3))
        .send(invalidDto)
        .expect(400);

      expect(response.body.error).toBe('Error de validación');
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details).toBeDefined();
    });

    it('debe retornar 400 si faltan campos obligatorios (postalCode)', async () => {
      const invalidDto = {
        email: 'doctor@example.com',
        password: 'password123',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'doctor',
        address: 'Av. Reforma 123',
        recaptchaToken: 'valid-token',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(4))
        .send(invalidDto)
        .expect(400);

      expect(response.body.error).toBe('Error de validación');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('debe retornar 400 si la bio excede 1000 caracteres', async () => {
      const longBio = 'a'.repeat(1001);
      const invalidDto = {
        ...getValidDoctorRegisterDto('-long-bio'),
        bio: longBio,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(5))
        .send(invalidDto)
        .expect(400);

      expect(response.body.error).toBe('Error de validación');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('debe retornar 409 si el email ya existe', async () => {
      const existingEmail = 'existing-doctor@example.com';

      // Crear médico existente primero
      await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(6))
        .send({
          ...getValidDoctorRegisterDto(),
          email: existingEmail,
        })
        .expect(201);

      // Intentar registrar el mismo email de nuevo
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(7))
        .send({
          ...getValidDoctorRegisterDto(),
          email: existingEmail,
        })
        .expect(409);

      expect(response.body.error).toBe('Email ya está registrado');
      expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('debe retornar 400 si reCAPTCHA es inválido', async () => {
      // Mock: reCAPTCHA falla
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

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(8))
        .send(getValidDoctorRegisterDto('-recaptcha'))
        .expect(400);

      expect(response.body.error).toContain('reCAPTCHA');
    });

    it('debe registrar en audit_logs para usuario y médico', async () => {
      const uniqueEmail = `audit-doctor-${Date.now()}@example.com`;
      await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(9))
        .send({
          ...getValidDoctorRegisterDto(),
          email: uniqueEmail,
        })
        .expect(201);

      const { AuditLog } = await import('../../../src/models/audit-log.entity');
      const auditLogRepository = AppDataSource.getRepository(AuditLog);

      // Verificar log de usuario
      const userLogs = await auditLogRepository.find({
        where: { action: 'register', entityType: 'user' },
      });
      expect(userLogs.length).toBeGreaterThan(0);

      // Verificar log de médico
      const doctorLogs = await auditLogRepository.find({
        where: { action: 'register', entityType: 'doctor' },
      });
      expect(doctorLogs.length).toBeGreaterThan(0);
      expect(doctorLogs[0].entityType).toBe('doctor');
    });

    it('debe aceptar registro sin bio (campo opcional)', async () => {
      const registerDtoWithoutBio = {
        ...getValidDoctorRegisterDto('-no-bio'),
        bio: undefined,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(10))
        .send(registerDtoWithoutBio)
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.doctor).toBeDefined();

      // Verificar que se guardó sin bio
      const userRepository = AppDataSource.getRepository(User);
      const doctorRepository = AppDataSource.getRepository(Doctor);

      const savedUser = await userRepository.findOne({
        where: { email: registerDtoWithoutBio.email },
      });
      const savedDoctor = await doctorRepository.findOne({
        where: { userId: savedUser!.id },
      });

      expect(savedDoctor?.bio).toBeNull();
    });

    it('debe aceptar registro sin teléfono (campo opcional)', async () => {
      const registerDtoWithoutPhone = {
        ...getValidDoctorRegisterDto('-no-phone'),
        phone: undefined,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(11))
        .send(registerDtoWithoutPhone)
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.phone).toBeUndefined();
    });
  });
});
