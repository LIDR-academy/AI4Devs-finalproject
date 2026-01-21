# 🧪 Plan de Pruebas - MS-PERSO

**Fecha**: 2025-01-28  
**Estado**: 📋 Planificado  
**Prioridad**: 🔴 ALTA - Antes de desarrollar Frontend

---

## 🎯 Recomendación: Pruebas Primero

### ¿Por qué pruebas antes del frontend?

1. ✅ **API Estable**: Asegura que el backend funciona correctamente antes de integrarlo
2. ✅ **Documentación Viva**: Los tests documentan el comportamiento esperado
3. ✅ **Prevención de Regresiones**: Detecta problemas antes de que lleguen al frontend
4. ✅ **Debugging Más Fácil**: Problemas aislados en backend sin complejidad del frontend
5. ✅ **Confianza**: El frontend se desarrolla sobre una base probada y estable
6. ✅ **CI/CD**: Permite automatizar validaciones en cada commit

---

## 📊 Estrategia de Testing (Pirámide)

```
        ╱╲
       ╱E2E╲          10% - End-to-End (flujos completos)
      ╱────╲
     ╱ Inte ╲         20% - Integration (APIs, DB)
    ╱────────╲
   ╱   Unit   ╲       70% - Unit Tests (lógica de negocio)
  ╱────────────╲
```

### Cobertura Objetivo
- **Overall**: ≥ 80%
- **Domain Logic (UseCases)**: ≥ 90%
- **Controllers**: ≥ 75%
- **Services**: ≥ 85%
- **Repositories**: ≥ 80%

---

## 🧪 Fase 1: Tests Unitarios (Prioridad ALTA)

### 1.1 UseCases (Lógica de Negocio)

**Archivos a crear**:
- `src/module/management/clien/application/usecase.spec.ts`
- `src/module/management/clbnc/application/usecase.spec.ts`
- `src/module/management/cldom/application/usecase.spec.ts`
- `src/module/management/cleco/application/usecase.spec.ts`
- ... (todos los módulos auxiliares)

**Casos críticos a probar**:

#### ClienUseCase
- ✅ `registrarClienteCompleto()` - Transacción completa con todos los módulos
- ✅ `findClienteCompletoById()` - Carga todas las relaciones
- ✅ `actualizarClienteCompleto()` - Actualización con sincronización de relaciones
- ✅ Validación de reglas de negocio (edad, estado civil, tipo persona)
- ✅ Reutilización de persona existente
- ✅ Validación de cliente activo antes de crear nuevo

#### ClbncUseCase (Banca Digital)
- ✅ `login()` - Autenticación con validación de password
- ✅ `changePassword()` - Validación de password actual
- ✅ `iniciarRecuperacionPassword()` - Generación de código
- ✅ `completarRecuperacionPassword()` - Validación de código y expiración
- ✅ `bloquear()` / `desbloquear()` - Gestión de estado

**Ejemplo de estructura**:
```typescript
describe('ClienUseCase', () => {
  let useCase: ClienUseCase;
  let mockRepository: jest.Mocked<ClienPort>;

  beforeEach(() => {
    mockRepository = {
      registrarClienteCompleto: jest.fn(),
      findClienteCompletoById: jest.fn(),
      // ... otros métodos
    } as any;
    useCase = new ClienUseCase(mockRepository);
  });

  describe('registrarClienteCompleto', () => {
    it('debe crear cliente completo con todos los módulos', async () => {
      // Arrange
      const personaData = { ... };
      const clienteData = { ... };
      // ... datos de módulos auxiliares

      mockRepository.registrarClienteCompleto.mockResolvedValue({ ... });

      // Act
      const result = await useCase.registrarClienteCompleto(...);

      // Assert
      expect(result).toBeDefined();
      expect(mockRepository.registrarClienteCompleto).toHaveBeenCalled();
    });

    it('debe lanzar error si persona ya es cliente activo', async () => {
      // Test de regla de negocio
    });
  });
});
```

### 1.2 Value Objects (Normalización)

**Archivos a crear**:
- `src/module/management/clien/domain/value/clien.value.spec.ts`
- `src/module/management/clbnc/domain/value/clbnc.value.spec.ts`
- ... (todos los value objects)

**Casos a probar**:
- ✅ Normalización de strings (trim, uppercase, lowercase)
- ✅ Padding de códigos (padStart con ceros)
- ✅ Valores por defecto
- ✅ Conversión a JSON (toJson())

### 1.3 Services (Formato de Respuestas)

**Archivos a crear**:
- `src/module/management/clien/infrastructure/service/service.spec.ts`
- `src/module/management/clbnc/infrastructure/service/service.spec.ts`
- ... (todos los services)

**Casos a probar**:
- ✅ Formato ApiResponse para operaciones individuales
- ✅ Formato ApiResponses para listados
- ✅ Manejo de errores y códigos HTTP
- ✅ Mensajes de información correctos

---

## 🔗 Fase 2: Tests de Integración (Prioridad MEDIA)

### 2.1 Repositories (Acceso a Datos)

**Archivos a crear**:
- `src/module/management/clien/infrastructure/repository/repository.spec.ts`
- `src/module/management/clbnc/infrastructure/repository/repository.spec.ts`
- ... (todos los repositories)

**Setup requerido**:
- Mock de `PgService`
- Base de datos de prueba (PostgreSQL test)

**Casos a probar**:
- ✅ Queries SQL correctas
- ✅ Prepared statements con parámetros
- ✅ Soft delete (deleted_at)
- ✅ Transacciones (PgService.transaction)
- ✅ Filtros y paginación

**Ejemplo**:
```typescript
describe('ClienDBRepository', () => {
  let repository: ClienDBRepository;
  let mockPgService: jest.Mocked<PgService>;

  beforeEach(() => {
    mockPgService = {
      queryList: jest.fn(),
      queryGet: jest.fn(),
      transaction: jest.fn(),
    } as any;
    repository = new ClienDBRepository(mockPgService);
  });

  describe('registrarClienteCompleto', () => {
    it('debe ejecutar transacción completa', async () => {
      mockPgService.transaction.mockImplementation(async (callback) => {
        return await callback(mockPgService);
      });
      // ... test
    });
  });
});
```

### 2.2 Controllers (Endpoints REST)

**Archivos a crear**:
- `src/module/management/clien/interface/controller/controller.spec.ts`
- `src/module/management/clbnc/interface/controller/controller.spec.ts`
- ... (todos los controllers)

**Casos a probar**:
- ✅ Rutas correctas
- ✅ Validación de DTOs
- ✅ Códigos HTTP apropiados
- ✅ Formato de respuestas
- ✅ Manejo de errores

---

## 🚀 Fase 3: Tests E2E (Prioridad BAJA - Después de Unit/Integration)

### 3.1 Flujos Completos

**Archivos a crear**:
- `test/e2e/clien/registrar-cliente-completo.e2e-spec.ts`
- `test/e2e/clbnc/login.e2e-spec.ts`
- `test/e2e/clbnc/recuperar-password.e2e-spec.ts`

**Casos a probar**:
- ✅ Flujo completo de registro de cliente
- ✅ Flujo completo de login y autenticación
- ✅ Flujo completo de recuperación de contraseña
- ✅ Flujo completo de actualización de cliente

**Setup requerido**:
- Base de datos de prueba real
- Servidor NestJS en modo test
- Limpieza de datos entre tests

---

## 📋 Checklist de Implementación

### Fase 1: Unit Tests (Semana 1)
- [x] UseCases principales (clien, clbnc) ✅ **71 tests pasando**
  - [x] ClienUseCase: 25 tests ✅
  - [x] ClbncUseCase: 46 tests ✅
- [ ] UseCases auxiliares (cldom, cleco, clrep, etc.)
- [x] Value Objects (normalización) ✅ **82 tests pasando**
  - [x] PersoValue: 18 tests ✅
  - [x] ClienValue: 12 tests ✅
  - [x] ClbncValue: 25 tests ✅
  - [x] CldomValue: 10 tests ✅
  - [x] ClecoValue: 7 tests ✅
  - [ ] Value Objects auxiliares restantes (clrep, clcyg, cllab, clref, clfin, clben, clrfi, clasm)
- [x] Services (formato de respuestas) ✅ **50 tests pasando**
  - [x] ClienService: 30 tests ✅
  - [x] ClbncService: 20 tests ✅
- [ ] Cobertura ≥ 80%

### Fase 2: Integration Tests (Semana 2)
- [x] Repositories con mock de PgService ✅ **46 tests (35 pasando)**
  - [x] ClienDBRepository: Tests básicos CRUD ✅
  - [x] ClbncDBRepository: Tests básicos CRUD ✅
  - [x] Tests de transacciones (registrarClienteCompleto, actualizarClienteCompleto) ✅
  - [x] Tests de prepared statements ✅
  - [x] Tests de soft delete ✅
  - [x] Tests de filtros y paginación ✅
- [x] Controllers con mock de Services ✅ **18 tests pasando**
  - [x] ClienController: Tests de rutas y respuestas ✅
  - [x] ClbncController: Tests de rutas y respuestas ✅
  - [x] Validación de códigos HTTP (200, 201) ✅
  - [x] Formato de respuestas ApiResponse/ApiResponses ✅
- [ ] Validación de DTOs (se prueba en E2E)
- [ ] Cobertura ≥ 75%

### Fase 3: E2E Tests (Semana 3)
- [x] Flujos críticos (registro, login, actualización) ✅ **4 archivos creados (20+ tests)**
  - [x] registrar-cliente-completo.e2e-spec.ts ✅ (7 tests de validación)
  - [x] login.e2e-spec.ts ✅ (7 tests de validación)
  - [x] recuperar-password.e2e-spec.ts ✅ (6 tests de validación)
  - [x] actualizar-cliente-completo.e2e-spec.ts ✅ (6 tests de validación)
  - [x] Validación de DTOs ✅
  - [x] Validación de códigos HTTP (400, 401, 404) ✅
  - [x] Validación de mensajes de error ✅
  - [x] Setup de variables de entorno (setup.ts) ✅
  - [x] Configuración de Jest E2E (jest-e2e.json) ✅
- [ ] Base de datos de prueba configurada (requiere setup manual)
- [ ] Tests con datos reales (requiere BD de prueba)
- [ ] Limpieza de datos entre tests
- [ ] CI/CD configurado
- [ ] Instalar @nestjs/swagger (dependencia faltante)

---

## 🛠️ Comandos de Ejecución

```bash
# Unit tests
npm run test

# Tests con cobertura
npm run test:cov

# Watch mode (desarrollo)
npm run test:watch

# E2E tests
npm run test:e2e

# Tests específicos
npm run test -- usecase.spec.ts
```

---

## 📊 Métricas de Éxito

### Antes de Frontend
- ✅ Cobertura ≥ 80%
- ✅ Todos los UseCases críticos probados
- ✅ Tests E2E de flujos principales pasando
- ✅ Sin errores de linter
- ✅ Documentación de API actualizada (Swagger)

### Criterios de Aceptación
- [ ] Todos los tests unitarios pasando
- [ ] Cobertura ≥ 80%
- [ ] Tests E2E críticos pasando
- [ ] Sin vulnerabilidades críticas (npm audit)
- [ ] Performance tests dentro de SLOs

---

## 🎯 Orden Recomendado de Implementación

1. **Semana 1**: Tests Unitarios de UseCases críticos
   - ClienUseCase (registrarClienteCompleto, findClienteCompletoById, actualizarClienteCompleto)
   - ClbncUseCase (login, changePassword, recuperarPassword)

2. **Semana 2**: Tests Unitarios de módulos auxiliares + Integration
   - UseCases auxiliares
   - Repositories con mocks
   - Controllers

3. **Semana 3**: Tests E2E de flujos críticos
   - Registro completo de cliente
   - Login y autenticación
   - Actualización de cliente

4. **Después**: Desarrollo de Frontend con API probada y estable

---

## 💡 Ventajas de este Enfoque

1. **Confianza**: El frontend se desarrolla sobre una API probada
2. **Velocidad**: Menos debugging en integración frontend-backend
3. **Calidad**: Problemas detectados temprano
4. **Documentación**: Tests como documentación viva
5. **Mantenibilidad**: Refactoring seguro con tests

---

**Recomendación Final**: ✅ **Implementar pruebas primero** antes de desarrollar el frontend.

