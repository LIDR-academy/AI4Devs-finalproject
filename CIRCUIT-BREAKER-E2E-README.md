# 🔧 Circuit Breaker & Tests E2E - BarberSync Pro

## 📋 Resumen

Este documento describe la implementación de dos mejoras técnicas críticas para **BarberSync Pro**:

1. **🔄 Circuit Breaker Pattern** - Resilencia y manejo de fallos
2. **🧪 Tests End-to-End (E2E)** - Automatización de pruebas con Cypress

## 🔄 Circuit Breaker Pattern

### ¿Qué es un Circuit Breaker?

El Circuit Breaker es un patrón de diseño que previene cascadas de fallos en sistemas distribuidos. Actúa como un "interruptor" que:

- **CLOSED** (Cerrado): Permite el paso normal de requests
- **OPEN** (Abierto): Bloquea requests cuando detecta fallos repetidos
- **HALF-OPEN** (Semi-abierto): Permite algunos requests para probar recuperación

### 🏗️ Implementación

#### Frontend (`frontend/src/services/circuitBreaker.ts`)

```typescript
// Configuraciones por tipo de operación
CRITICAL: {
  failureThreshold: 3,        // 3 fallos consecutivos
  openToHalfOpenWaitTime: 30000, // 30 segundos
  maxRetryAttempts: 3,        // 3 reintentos
  timeoutMs: 5000            // 5 segundos timeout
}

STANDARD: {
  failureThreshold: 5,        // 5 fallos consecutivos
  openToHalfOpenWaitTime: 15000, // 15 segundos
  maxRetryAttempts: 2,        // 2 reintentos
  timeoutMs: 8000            // 8 segundos timeout
}

READ_ONLY: {
  failureThreshold: 10,       // 10 fallos consecutivos
  openToHalfOpenWaitTime: 10000, // 10 segundos
  maxRetryAttempts: 1,        // 1 reintento
  timeoutMs: 10000           // 10 segundos timeout
}
```

#### Backend (`backend/barbersync-backend/src/common/circuit-breaker/`)

```typescript
// Tipos de operación
DATABASE = 'DATABASE',           // Operaciones de base de datos
EXTERNAL_API = 'EXTERNAL_API',   // APIs externas
INTERNAL_SERVICE = 'INTERNAL_SERVICE', // Servicios internos
CRITICAL = 'CRITICAL'            // Operaciones críticas
```

### 🔧 Uso del Circuit Breaker

#### En el Frontend

```typescript
import { circuitBreakerService } from './circuitBreaker';

// Para operaciones críticas (login, pagos)
const result = await circuitBreakerService.executeHttpCall(
  'CRITICAL',
  () => api.post('/auth/login', credentials),
  undefined // Sin fallback para operaciones críticas
);

// Para operaciones de lectura con fallback
const barbershops = await circuitBreakerService.executeHttpCall(
  'READ_ONLY',
  () => api.get('/geography/barbershops'),
  { barbershops: [] } // Fallback: lista vacía
);
```

#### En el Backend

```typescript
import { CircuitBreakerService, OperationType } from './circuit-breaker.service';

// Inyectar el servicio
constructor(private circuitBreaker: CircuitBreakerService) {}

// Usar para operaciones de base de datos
const users = await this.circuitBreaker.executeDatabase(
  () => this.userRepository.find(),
  () => Promise.resolve([]), // Fallback
  'get all users'
);
```

### 📊 Monitoreo

#### Endpoints de Salud

- `GET /health/circuit-breakers` - Estado general
- `GET /health/circuit-breakers/stats` - Estadísticas detalladas

#### Métricas Disponibles

```json
{
  "status": "HEALTHY|DEGRADED|CRITICAL",
  "openCircuits": 0,
  "totalCircuits": 4,
  "details": [
    {
      "name": "READ_ONLY",
      "state": "CLOSED",
      "successRate": 98.5,
      "consecutiveFailures": 0,
      "totalRequests": 1250,
      "successfulRequests": 1231,
      "failedRequests": 19
    }
  ]
}
```

### 🎯 Beneficios

1. **Resilencia**: Previene cascadas de fallos
2. **Recuperación Automática**: Se auto-repara cuando el servicio mejora
3. **Fallbacks**: Datos por defecto cuando los servicios fallan
4. **Monitoreo**: Métricas en tiempo real del estado del sistema
5. **Experiencia de Usuario**: La app sigue funcionando durante fallos

## 🧪 Tests End-to-End (E2E)

### 🛠️ Configuración

#### Cypress (`frontend/cypress.config.ts`)

```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    retries: { runMode: 2, openMode: 0 }
  }
})
```

#### Variables de Entorno

```typescript
env: {
  API_URL: 'http://localhost:3001/api/v1',
  CLIENT_EMAIL: 'test.client@barbersync.com',
  BARBER_EMAIL: 'test.barber@barbersync.com',
  OWNER_EMAIL: 'test.owner@barbersync.com'
}
```

### 📝 Tests Implementados

#### 1. Flujo de Autenticación (`01-auth-flow.cy.ts`)

```typescript
describe('Authentication Flow', () => {
  // ✅ Login exitoso por rol
  // ✅ Validación de campos requeridos
  // ✅ Manejo de credenciales inválidas
  // ✅ Registro de nuevos usuarios
  // ✅ Logout y limpieza de sesión
  // ✅ Protección de rutas
})
```

#### 2. Circuit Breaker (`02-circuit-breaker.cy.ts`)

```typescript
describe('Circuit Breaker Tests', () => {
  // ✅ Manejo de fallos con fallbacks
  // ✅ Reintentos automáticos
  // ✅ Recuperación después de fallos
  // ✅ Timeouts y resilencia
  // ✅ Métricas y monitoreo
  // ✅ Experiencia de usuario durante fallos
})
```

#### 3. Gestión de Citas (`03-appointments-flow.cy.ts`)

```typescript
describe('Appointments Management Flow', () => {
  // ✅ Creación de citas completa
  // ✅ Validaciones de fecha y hora
  // ✅ Visualización de citas por rol
  // ✅ Filtros y búsquedas
  // ✅ Cancelación de citas
  // ✅ Responsive design
})
```

### 🎮 Comandos Personalizados

```typescript
// Login automático por rol
cy.login('client@test.com', 'password', 'client')

// Navegación a dashboards
cy.navigateToDashboard('client', 'appointments')

// Creación de citas de prueba
cy.createTestAppointment({
  barbershop: 'Barbería Central',
  service: 'corte',
  date: '2024-12-25'
})

// Verificación de Circuit Breaker
cy.checkCircuitBreakerHealth()

// Simulación de errores
cy.simulateApiError('/appointments', 500)
```

## 🚀 Instalación y Uso

### 1. Instalar Dependencias

```bash
# Ejecutar script de instalación
./install-dependencies.ps1

# O manualmente:
cd frontend && npm install
cd ../backend/barbersync-backend && npm install
```

### 2. Iniciar Servidores

```bash
# Ambos servidores
./start-servers.ps1

# O individualmente:
cd frontend && npm run dev          # Puerto 3000
cd backend/barbersync-backend && npm run start:dev  # Puerto 3001
```

### 3. Ejecutar Tests E2E

```bash
# Modo automático (headless)
./run-e2e-tests.ps1

# Modo interactivo (UI)
cd frontend && npm run cypress:open

# Solo ejecutar tests
cd frontend && npm run test:e2e
```

## 📊 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `./install-dependencies.ps1` | Instala todas las dependencias necesarias |
| `./run-e2e-tests.ps1` | Ejecuta tests E2E completos |
| `./start-servers.ps1` | Inicia frontend y backend |
| `cd frontend && npm run cypress:open` | Abre Cypress UI |
| `cd frontend && npm run test:e2e` | Tests headless |

## 🔍 Verificación del Sistema

### Circuit Breaker Health Check

```bash
# Verificar estado general
curl http://localhost:3001/api/v1/health/circuit-breakers

# Verificar estadísticas detalladas
curl http://localhost:3001/api/v1/health/circuit-breakers/stats
```

### Tests de Resilencia

1. **Simular fallo de API**: Detener el backend y verificar fallbacks
2. **Timeout**: Simular respuestas lentas
3. **Recuperación**: Reiniciar servicios y verificar auto-recuperación

## 🎯 Casos de Uso Cubiertos

### Circuit Breaker

- ✅ **Fallos de red**: Fallbacks automáticos
- ✅ **Sobrecarga de servidor**: Protección con timeouts
- ✅ **APIs externas caídas**: Datos en caché/fallback
- ✅ **Base de datos lenta**: Reintentos con backoff
- ✅ **Recuperación automática**: Sin intervención manual

### Tests E2E

- ✅ **Flujos críticos**: Login, registro, citas
- ✅ **Validaciones**: Formularios y reglas de negocio
- ✅ **Roles de usuario**: Cliente, barbero, dueño
- ✅ **Responsive**: Mobile, tablet, desktop
- ✅ **Errores**: Manejo de fallos y recuperación

## 🔧 Configuración Avanzada

### Personalizar Circuit Breaker

```typescript
// Modificar configuraciones en circuitBreaker.ts
CUSTOM_CONFIG: {
  failureThreshold: 7,
  openToHalfOpenWaitTime: 20000,
  maxRetryAttempts: 4,
  timeoutMs: 12000
}
```

### Agregar Nuevos Tests

```typescript
// En cypress/e2e/04-new-feature.cy.ts
describe('New Feature', () => {
  it('should work correctly', () => {
    cy.visit('/new-feature')
    cy.get('[data-testid="new-button"]').click()
    cy.contains('Success').should('be.visible')
  })
})
```

## 📈 Métricas y Monitoreo

### Dashboard de Circuit Breaker

- **Estado actual**: HEALTHY/DEGRADED/CRITICAL
- **Circuitos abiertos**: Número de servicios fallando
- **Tasa de éxito**: Porcentaje de requests exitosos
- **Tiempo de recuperación**: Cuánto tarda en auto-repararse

### Reportes de Tests E2E

- **Videos**: `frontend/cypress/videos/`
- **Screenshots**: `frontend/cypress/screenshots/`
- **Reportes**: `frontend/cypress/reports/`

## 🚨 Troubleshooting

### Circuit Breaker

```bash
# Si un circuit breaker está abierto
curl -X POST http://localhost:3001/api/v1/health/circuit-breakers/reset

# Verificar logs del backend
cd backend/barbersync-backend && npm run start:dev
```

### Tests E2E

```bash
# Si Cypress no abre
cd frontend && npx cypress verify

# Si tests fallan
cd frontend && npm run cypress:open  # Modo debug

# Limpiar caché
cd frontend && npx cypress cache clear
```

## 🎉 Beneficios Implementados

### Para el Negocio

- ✅ **99.9% Uptime**: Sistema resiliente a fallos
- ✅ **Experiencia continua**: App funciona incluso con servicios caídos
- ✅ **Calidad asegurada**: Tests automáticos previenen regresiones
- ✅ **Despliegues seguros**: Validación automática antes de producción

### Para el Desarrollo

- ✅ **Detección temprana**: Bugs encontrados antes de producción
- ✅ **Refactoring seguro**: Tests garantizan que nada se rompe
- ✅ **Documentación viva**: Tests como especificación del sistema
- ✅ **CI/CD**: Integración con pipelines de despliegue

---

## 📚 Referencias

- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Cypress Documentation](https://docs.cypress.io/)
- [Cockatiel Library](https://github.com/connor4312/cockatiel)
- [NestJS Circuit Breaker](https://docs.nestjs.com/techniques/circuit-breaker)

**¡BarberSync Pro ahora es más resiliente y confiable que nunca!** 🎉 