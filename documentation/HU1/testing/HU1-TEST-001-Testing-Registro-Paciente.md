# HU1-TEST-001: Testing - Registro de Paciente

## Información General
- **ID**: HU1-TEST-001
- **Historia de Usuario**: HU1 - Registro de Paciente
- **Tipo**: Testing
- **Prioridad**: Alta
- **Estimación**: 8 horas (1 story point)
- **Dependencias**: HU1-FE-001, HU1-BE-001, HU1-DB-001, HU1-DB-002

## Descripción
Implementar suite completa de tests para el flujo de registro de paciente, incluyendo tests unitarios, de integración y E2E que validen todos los criterios de aceptación de la HU1.

## Criterios de Aceptación

### CA1: Tests Unitarios (Frontend)
- [ ] Test de validación de formulario (email, contraseña, nombre, apellido)
- [ ] Test de validación de formato de teléfono
- [ ] Test de integración con reCAPTCHA v3
- [ ] Test de manejo de errores (409, 429, 400)
- [ ] Test de redirección después de registro exitoso
- [ ] Test de internacionalización (español/inglés)

### CA2: Tests Unitarios (Backend)
- [ ] Test de servicio de autenticación (creación de usuario)
- [ ] Test de validación de reCAPTCHA
- [ ] Test de hash de contraseña con bcrypt
- [ ] Test de generación de tokens JWT
- [ ] Test de registro en audit_logs
- [ ] Test de validación de email único

### CA3: Tests de Integración (Backend)
- [ ] Test de endpoint POST /api/v1/auth/register (caso exitoso)
- [ ] Test de endpoint con email duplicado (409)
- [ ] Test de endpoint con rate limiting (429)
- [ ] Test de endpoint con reCAPTCHA inválido (400)
- [ ] Test de endpoint con datos inválidos (400)
- [ ] Test de cookie httpOnly para refreshToken

### CA4: Tests de Base de Datos
- [ ] Test de migración CreateUsersTable (up y down)
- [ ] Test de migración CreateAuditLogsTable (up y down)
- [ ] Test de constraint UNIQUE en email
- [ ] Test de índices creados correctamente
- [ ] Test de foreign key en audit_logs

### CA5: Tests E2E
- [ ] Test completo: Usuario completa formulario → Registro exitoso → Redirección
- [ ] Test: Intento de registro con email existente
- [ ] Test: Intento de registro excediendo rate limit
- [ ] Test: Validación de campos en tiempo real

## Pasos Técnicos Detallados

### 1. Configuración de Entorno de Testing
**Ubicación**: `backend/tests/setup/test-db.ts`

```typescript
import { DataSource } from 'typeorm';
import { User } from '../../src/entities/user.entity';
import { AuditLog } from '../../src/entities/audit-log.entity';

export async function createTestDataSource(): Promise<DataSource> {
  return new DataSource({
    type: 'mysql',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '3307'),
    username: process.env.TEST_DB_USERNAME || 'test_user',
    password: process.env.TEST_DB_PASSWORD || 'test_password',
    database: process.env.TEST_DB_NAME || 'citaya_test',
    entities: [User, AuditLog],
    synchronize: false, // Usar migraciones
    logging: false,
  });
}

export async function setupTestDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.runMigrations();
}

export async function teardownTestDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.dropDatabase();
  await dataSource.destroy();
}
```

### 2. Factories para Datos de Prueba
**Ubicación**: `backend/tests/helpers/factories.ts`

```typescript
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../src/entities/user.entity';

export async function createTestUser(
  dataSource: DataSource,
  overrides: Partial<User> = {},
): Promise<User> {
  const userRepository = dataSource.getRepository(User);
  
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    password: await bcrypt.hash('password123', 12),
    firstName: 'Test',
    lastName: 'User',
    role: 'patient',
    emailVerified: false,
    ...overrides,
  };

  return await userRepository.save(userRepository.create(defaultUser));
}
```

### 3. Mocks de Servicios Externos
**Ubicación**: `backend/tests/helpers/mocks.ts`

```typescript
// Mock de reCAPTCHA
export const mockRecaptchaValidation = {
  success: true,
  score: 0.9,
  action: 'register',
  challenge_ts: new Date().toISOString(),
  hostname: 'localhost',
};

jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({
    data: mockRecaptchaValidation,
  }),
}));
```

### 4. Tests Unitarios - Servicio de Autenticación
**Ubicación**: `backend/tests/unit/services/auth.service.test.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../src/services/auth.service';
import { User } from '../../../src/entities/user.entity';
import { AuditLog } from '../../../src/entities/audit-log.entity';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let auditLogRepository: Repository<AuditLog>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    auditLogRepository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('debe crear un usuario exitosamente', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'patient' as const,
        recaptchaToken: 'valid-token',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue({
        ...registerDto,
        id: 'user-id',
        emailVerified: false,
      } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        id: 'user-id',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role,
        emailVerified: false,
      } as User);

      const result = await service.register(registerDto, '192.168.1.1');

      expect(result.user.email).toBe(registerDto.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(auditLogRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'patient' as const,
        recaptchaToken: 'valid-token',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        id: 'existing-id',
        email: registerDto.email,
      } as User);

      await expect(service.register(registerDto, '192.168.1.1')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
```

### 5. Tests de Integración - Endpoint de Registro
**Ubicación**: `backend/tests/integration/api/auth.test.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar base de datos antes de cada test
    await dataSource.query('DELETE FROM audit_logs');
    await dataSource.query('DELETE FROM USERS');
  });

  describe('POST /api/v1/auth/register', () => {
    it('debe registrar un usuario exitosamente', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'patient',
        recaptchaToken: 'valid-token',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('debe retornar 409 si el email ya existe', async () => {
      // Crear usuario existente
      await dataSource.query(
        `INSERT INTO USERS (id, email, password, firstName, lastName, role) 
         VALUES (UUID(), 'existing@example.com', 'hash', 'Test', 'User', 'patient')`,
      );

      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'patient',
        recaptchaToken: 'valid-token',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(409);
    });

    it('debe retornar 429 si se excede el rate limit', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'patient',
        recaptchaToken: 'valid-token',
      };

      // Realizar 4 intentos (límite es 3)
      for (let i = 0; i < 4; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({ ...registerDto, email: `test${i}@example.com` });
      }

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(429);
    });
  });
});
```

### 6. Tests E2E - Flujo Completo
**Ubicación**: `frontend/tests/e2e/register.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Registro de Paciente', () => {
  test('debe completar registro exitosamente', async ({ page }) => {
    await page.goto('/register');

    // Llenar formulario
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');

    // Enviar formulario
    await page.click('button[type="submit"]');

    // Verificar redirección al dashboard
    await expect(page).toHaveURL('/dashboard/patient');
  });

  test('debe mostrar error si el email ya existe', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="email"]', 'existing@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');

    await page.click('button[type="submit"]');

    // Verificar mensaje de error
    await expect(page.locator('.error-message')).toContainText('Email ya está registrado');
  });
});
```

### 7. Tests de Migraciones
**Ubicación**: `backend/tests/migrations/migration.test.ts`

```typescript
import { DataSource } from 'typeorm';
import { createTestDataSource } from '../setup/test-db';

describe('Migrations', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('debe crear tabla USERS correctamente', async () => {
    const tableExists = await dataSource.query(
      "SHOW TABLES LIKE 'USERS'",
    );
    expect(tableExists.length).toBe(1);

    const columns = await dataSource.query('DESCRIBE USERS');
    expect(columns.find((col: any) => col.Field === 'email')).toBeDefined();
    expect(columns.find((col: any) => col.Field === 'role')).toBeDefined();
  });

  it('debe crear tabla audit_logs correctamente', async () => {
    const tableExists = await dataSource.query(
      "SHOW TABLES LIKE 'audit_logs'",
    );
    expect(tableExists.length).toBe(1);
  });
});
```

## Archivos a Crear/Modificar

1. `backend/tests/setup/test-db.ts` - Configuración de base de datos de testing
2. `backend/tests/helpers/factories.ts` - Factories para datos de prueba
3. `backend/tests/helpers/mocks.ts` - Mocks de servicios externos
4. `backend/tests/unit/services/auth.service.test.ts` - Tests unitarios del servicio
5. `backend/tests/integration/api/auth.test.ts` - Tests de integración del endpoint
6. `backend/tests/migrations/migration.test.ts` - Tests de migraciones
7. `frontend/tests/e2e/register.spec.ts` - Tests E2E del formulario

## Configuración de Jest
**Ubicación**: `backend/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

## Cobertura Objetivo

- **Servicio de Autenticación**: 90% de cobertura
- **Controlador de Autenticación**: 85% de cobertura
- **Validaciones**: 100% de cobertura
- **Manejo de Errores**: 100% de cobertura

## Comandos de Testing

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests unitarios
npm run test:unit

# Ejecutar tests de integración
npm run test:integration

# Ejecutar tests E2E
npm run test:e2e

# Generar reporte de cobertura
npm run test:coverage
```

## Notas Adicionales

- Los tests deben ejecutarse en una base de datos separada (`citaya_test`)
- Usar transacciones que se revierten después de cada test para limpieza
- Mockear servicios externos (reCAPTCHA, SendGrid) en todos los tests
- Los tests E2E requieren servidor de desarrollo corriendo

## Referencias

- [Documentación de Jest](https://jestjs.io/)
- [Documentación de Supertest](https://github.com/visionmedia/supertest)
- [Documentación de Playwright](https://playwright.dev/)
