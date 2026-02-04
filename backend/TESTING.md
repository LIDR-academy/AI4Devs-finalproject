# Guía de Testing - SIGQ Backend

Esta guía describe cómo ejecutar y escribir tests para el backend de SIGQ.

## Tipos de Tests

### 1. Tests Unitarios
Prueban componentes individuales (servicios, controladores) de forma aislada.

**Ubicación**: `src/**/*.spec.ts`

**Ejecutar**:
```bash
npm test
npm test -- --watch  # Modo watch
npm test -- --coverage  # Con cobertura
```

### 2. Tests de Integración
Prueban la interacción entre múltiples componentes.

**Ubicación**: `src/**/*.spec.ts` (mismo formato que unitarios)

### 3. Tests E2E (End-to-End)
Prueban flujos completos desde el punto de vista del usuario.

**Ubicación**: `test/**/*.e2e-spec.ts`

**Ejecutar**:
```bash
npm run test:e2e
```

## Estructura de Tests

### Test Unitario Ejemplo

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { Service } from './service';

describe('Service', () => {
  let service: Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Service],
    }).compile();

    service = module.get<Service>(Service);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('método', () => {
    it('debería hacer algo', async () => {
      const result = await service.método();
      expect(result).toBeDefined();
    });
  });
});
```

### Test E2E Ejemplo

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .expect(200);
  });
});
```

## Tests Disponibles

### Servicios
- ✅ `AuthService` - Autenticación y autorización
- ✅ `HceService` - Gestión de pacientes
- ✅ `PlanningService` - Planificación quirúrgica
- ✅ `AuditService` - Auditoría y logging
- ✅ `BackupService` - Backups automáticos

### Controladores E2E
- ✅ `AppController` - Health check y endpoints básicos
- ✅ `AuthController` - Flujos de autenticación
- ✅ `HceController` - CRUD de pacientes
- ✅ `Security` - Tests de seguridad y rate limiting

## Cobertura de Código

### Ver Cobertura
```bash
npm run test:cov
```

Esto genera un reporte en `coverage/` que puedes abrir en el navegador.

### Cobertura Objetivo
- **Servicios críticos**: >80%
- **Controladores**: >70%
- **Módulos completos**: >75%

## Mejores Prácticas

### 1. Nombres Descriptivos
```typescript
it('debería crear un paciente con todos los campos requeridos', async () => {
  // ...
});
```

### 2. Arrange-Act-Assert
```typescript
it('debería actualizar un paciente', async () => {
  // Arrange: Preparar datos
  const patientId = uuidv4();
  const updateDto = { firstName: 'Nuevo' };
  
  // Act: Ejecutar acción
  const result = await service.updatePatient(patientId, updateDto);
  
  // Assert: Verificar resultado
  expect(result.firstName).toBe('Nuevo');
});
```

### 3. Mocks y Stubs
```typescript
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

// En el test
mockRepository.findOne.mockResolvedValue(mockData);
```

### 4. Limpieza
```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

## Tests de Seguridad

Los tests de seguridad verifican:
- ✅ Autenticación (tokens válidos/inválidos)
- ✅ Autorización (roles y permisos)
- ✅ Validación de entrada (DTOs)
- ✅ Rate limiting
- ✅ CORS

## Troubleshooting

### Error: "Cannot find module"
Asegúrate de que las rutas en `moduleNameMapper` en `jest.config` sean correctas.

### Error: "Database connection"
Los tests E2E pueden requerir una base de datos de prueba. Configura variables de entorno de test.

### Tests Lentos
- Usa mocks en lugar de conexiones reales cuando sea posible
- Ejecuta tests en paralelo (Jest lo hace por defecto)
- Usa `--maxWorkers` para limitar paralelismo si es necesario

## CI/CD

Para integración continua, ejecuta:

```bash
# Tests unitarios con cobertura
npm run test:cov

# Tests E2E
npm run test:e2e

# Linter
npm run lint
```

## Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/visionmedia/supertest)
