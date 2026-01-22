import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AppDataSource } from '../../../src/config/database';
import { errorHandler } from '../../../src/middleware/error-handler.middleware';
import authRoutes from '../../../src/routes/auth.routes';
import { clearTestDatabase } from '../../setup/test-db';
import axios from 'axios';

// Mock de axios para reCAPTCHA
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthController (Integration)', () => {
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
    process.env.DB_HOST = process.env.DB_HOST || 'localhost';
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
    // Crear nueva instancia de app para cada test (para evitar compartir rate limiter)
    app = createTestApp();
    
    // Limpiar base de datos antes de cada test
    await clearTestDatabase(AppDataSource);

    // Mock de reCAPTCHA por defecto (éxito)
    mockedAxios.post.mockResolvedValue({
      data: {
        success: true,
        score: 0.9,
      },
    });

    // Configurar variables de entorno para testing
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key';
    process.env.RECAPTCHA_THRESHOLD = '0.5';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    const getValidRegisterDto = (emailSuffix = '') => ({
      email: `test${emailSuffix}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'patient' as const,
      recaptchaToken: 'valid-token',
    });

    const getUniqueIp = (suffix: number) => `192.168.1.${suffix}`;

    it('debe registrar un usuario exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(1))
        .send(getValidRegisterDto('-success'))
        .expect(201);

      const registerDto = getValidRegisterDto('-success');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user.firstName).toBe(registerDto.firstName);
      expect(response.body.user.lastName).toBe(registerDto.lastName);
      expect(response.body.user.role).toBe('patient');
      expect(response.body.user.emailVerified).toBe(false);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('debe retornar 409 si el email ya existe', async () => {
      const existingEmail = 'existing@example.com';
      
      // Crear usuario existente primero usando el endpoint
      await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(2))
        .send({
          ...getValidRegisterDto(),
          email: existingEmail,
        })
        .expect(201);

      // Intentar registrar el mismo email de nuevo
      const registerDto = {
        ...getValidRegisterDto(),
        email: existingEmail,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(20)) // IP diferente para evitar rate limit
        .send(registerDto)
        .expect(409);

      expect(response.body.error).toBe('Email ya está registrado');
      expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('debe retornar 400 si los datos son inválidos', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: '123', // Muy corta
        firstName: '',
        lastName: 'User',
        role: 'patient',
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

    it('debe retornar 400 si reCAPTCHA es inválido', async () => {
      // Mock: reCAPTCHA falla
      mockedAxios.post.mockResolvedValue({
        data: {
          success: false,
          score: 0.3,
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(4))
        .send(getValidRegisterDto('-recaptcha'))
        .expect(400);

      expect(response.body.error).toContain('reCAPTCHA');
    });

    it('debe retornar 429 si se excede el rate limit', async () => {
      const testIp = '192.168.1.100';
      
      // Realizar 3 intentos exitosos desde la misma IP (límite es 3 por hora)
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/v1/auth/register')
          .set('X-Forwarded-For', testIp)
          .send({
            ...getValidRegisterDto(),
            email: `test-rate-${i}@example.com`,
          })
          .expect(201);
      }

      // El cuarto intento desde la misma IP debe fallar con 429
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', testIp)
        .send({
          ...getValidRegisterDto(),
          email: 'test-rate-limit@example.com',
        })
        .expect(429);

      expect(response.body.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(response.body.retryAfter).toBeDefined();
    });

    it('debe configurar cookie httpOnly para refreshToken', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(5))
        .send(getValidRegisterDto('-cookie'))
        .expect(201);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      
      // cookies puede ser string o array
      const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
      const refreshTokenCookie = cookiesArray.find((cookie: string) =>
        cookie.startsWith('refreshToken=')
      );
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('HttpOnly');
    });

    it('debe registrar en audit_logs después de registro exitoso', async () => {
      const uniqueEmail = `audit-test-${Date.now()}@example.com`;
      await request(app)
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', getUniqueIp(6))
        .send({
          ...getValidRegisterDto(),
          email: uniqueEmail,
        })
        .expect(201);

      const { AuditLog } = await import('../../../src/models/audit-log.entity');
      const auditLogRepository = AppDataSource.getRepository(AuditLog);
      const logs = await auditLogRepository.find({
        where: { action: 'register', entityType: 'user' },
      });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].entityType).toBe('user');
      expect(logs[0].action).toBe('register');
    });
  });
});
