
# 🧭 Backend Delivery Playbook — Meditation Builder
**Versión:** 2.1.1 (Actualizado con estado real: US2, US3, US4 implementadas)
**Ámbito:** `/backend` – Microservicio Java 21 + Spring Boot + Arquitectura Hexagonal

---

# 0. Propósito del Playbook
Este documento define **cómo debe entregarse cualquier Historia de Usuario** en el backend del proyecto Meditation Builder.

**Estado actual del proyecto (Febrero 2026)**:
- ✅ **BC 1: `meditationbuilder`** (US2 - Compose Content) - Completado
- ✅ **BC 2: `meditation.generation`** (US3 - A/V Generation) - Completado
- ✅ **BC 3: `playback`** (US4 - List & Play) - Completado
- ❌ **BC 4**: Auth (US1 - Pendiente)

Alinea el trabajo técnico con:
- La **Constitución del proyecto**
- El **pipeline vertical** (BDD → API First → Dominio → Aplicación → Infra → Controllers → Contratos → E2E → CI/CD)
- La **arquitectura hexagonal estricta**
- **DDD**, **TDD**, **API First**, **CI/CD gating**
- Compliance con Speckit + Claude 4.5 Sonnet

El objetivo es garantizar que **cada historia es vertical, trazable, testeable y desplegable**.

---

# 1. Principios Rectores
El backend se rige por 7 principios normativos:

### 1.1 BDD-first
Todo desarrollo nace en un `.feature`. Nada se implementa sin BDD.

### 1.2 API First mínima
OpenAPI modela el contrato **mínimo necesario** para cumplir el BDD.

### 1.3 Arquitectura Hexagonal
Separación absoluta entre:
- Dominio
- Aplicación
- Infraestructura
- Adaptadores de entrada (Controllers)

### 1.4 DDD táctico
El dominio refleja reglas del negocio: entidades, VOs, invariantes, puertos.

### 1.5 TDD obligatorio
Tests de dominio van antes del código.

### 1.6 Infraestructura obediente
Implementa puertos del dominio, nunca define reglas.

### 1.7 Controllers delgados
Sin lógica, sin decisiones, sin ifs de negocio.

---

# 2. Estructura del Backend (Normativa)
Todo backend vive bajo:
```
/backend
    src/main/java/com/hexagonal/<boundedContext>/
    src/main/resources/openapi/
    src/test/java/...
    tests/bdd/
    tests/contracts/
    tests/e2e/
```

## 2.1 Estructura hexagonal detallada
```
/backend/src/main/java/com/hexagonal/<bc>/
  application/
    mapper/
    service/
    validator/
  domain/
    enums/
    model/
    exception/
    ports/
       in/
       out/
  infrastructure/
    in/
      rest/                  # Adaptadores HTTP REST
        controller/
        dto/
        mapper/
      kafka/                 # (ejemplo - no implementado aún)
    out/
      persistence/           # Adaptadores de persistencia
        impl/
        mapper/
        model/
        repository/
      service/               # Adaptadores a servicios externos (AI, APIs)
        dto/
        mapper/
      mongodb/               # (ejemplo - no implementado aún)
        impl/
        mapper/
        model/
        repository/
      kafka/                 # (ejemplo - no implementado aún)
    config/                  # Configuración de infraestructura

shared/                      # Módulo transversal
  errorhandler/
    dto/
    enums/
    exception/
  observability/
  openapi/
  security/
  utils/
```

**Note**: `kafka/` and `mongodb/` are **examples** of potential future technology choices for messaging/persistence adapters. 

**Current implementation** uses:
- **Inbound adapters**: `rest/` (HTTP REST Controllers)
- **Outbound adapters**: 
  - `persistence/` (InMemoryRepository for BC meditationbuilder, PostgreSQL/JPA for BC meditation.generation)
  - `service/` (OpenAI adapters for BC meditationbuilder, Google TTS + FFmpeg + S3 for BC meditation.generation)
  - `adapter/` (Google TTS, FFmpeg, S3 for BC meditation.generation)

## 2.2 OpenAPI
```
/backend/src/main/resources/openapi/
/backend/src/main/resources/openapi/common/
/backend/src/main/resources/openapi/<boundedContext>/
```

## 2.3 Testing backend
```
/backend/src/test/resources/features/<boundedContext>/  # .feature files (BDD)
/backend/src/test/java/com/hexagonal/<bc>/bdd/          # Step definitions & runners
/backend/src/test/java/com/hexagonal/<bc>/e2e/          # E2E tests (Spring Boot)
/backend/src/test/contracts/                             # Contract tests (implemented and active in CI)
/backend/src/test/java/...                               # Unit + integration tests
```

---

# 3. Pipeline obligatorio por historia
Cada Historia **DEBE** recorrer estas fases en orden:
```
1) BDD First
2) API First mínima
3) Dominio
4) Aplicación
5) Infraestructura
6) Controllers
7) Contratos
8) E2E
9) CI/CD gates (8 gates bloqueantes)
10) Done = deployable
```

---

# 4. Fase 1 — BDD FIRST
## Entregables mínimos:
- Archivo `.feature` en `/backend/src/test/resources/features/<boundedContext>/<feature>.feature`
- Step definitions en `/backend/src/test/java/com/hexagonal/<bc>/bdd/steps/`
- Escenarios Given–When–Then orientados a negocio
- Step definitions pending (inicialmente)

## Reglas:
- Prohibido HTTP/JSON/DTOs/repositorios o UI
- Nada se implementa hasta tener BDD

---

# 5. Fase 2 — API FIRST mínimo
## Entregables:
- YAML OpenAPI validado en:
```
/backend/src/main/resources/openapi/<boundedContext>/<feature>.yaml
```

## Reglas:
- Cada `When` del BDD corresponde a una capacidad expuesta
- No endpoints inventados
- Lint obligatorio
- Tests provider/consumer obligatorios

---

# 6. Fase 3 — Dominio (DDD + TDD)
## Entregables:
- Entidades y VOs
- Puertos in/out
- Tests TDD

## Reglas:
- Sin Spring, sin HTTP, sin JSON
- Lógica de negocio pura
- Invariantes explícitas

---

# 7. Fase 4 — Aplicación (Use Cases)
## Entregables:
- Use cases (ej: `GenerateMeditationTextUseCase`)
- Validadores simples
- Mappers
- Tests de orquestación

## Reglas:
- Sin lógica de negocio
- Sin acceso directo a infraestructura

---

# 8. Fase 5 — Infraestructura (Adapters)
## Entregables:
- Adaptadores IA (`TextGenerationAiAdapter`, etc.)
- Mappers
- Tests integración

## Reglas:
- Implementan puertos out
- Manejo de errores IA → HTTP (429/503)
- Prohibido loguear prompts IA

---

# 9. Fase 6 — Controllers
## Entregables:
- Controllers REST
- DTOs
- Validación superficial

## Reglas:
- Cero lógica de negocio
- Cumplimiento estricto OpenAPI

---

# 10. Fase 7 — Contratos
## Entregables:
- Tests contractuales

## Reglas:
- Backend debe cumplir OpenAPI
- Cambios rompientes deben detectarse

---

# 11. Fase 8 — E2E
## Entregables:
- Cucumber E2E sobre backend real

## Reglas:
- Sin servicios externos reales

---

# 12. Fase 9 — CI/CD (8 gates bloqueantes)
Pipeline estricto **ACTUAL**:
```
1. BDD Tests (Cucumber)
2. API Validation (OpenAPI lint)
3. Unit Domain Tests
4. Unit Application Tests
5. Infrastructure Integration Tests (Testcontainers si aplica)
6. Contract Tests (OpenAPI compliance)
7. E2E Tests (Spring Boot + mocks)
8. Build (Maven clean install + JAR)
```

**Configuración especial para BC Generation**:
- FFmpeg instalado en CI environment
- LocalStack para S3 (Testcontainers)
- PostgreSQL (Testcontainers)
- Google TTS API mock (WireMock)

---

# 13. Artefactos obligatorios por fase
| Fase | Artefacto | Ubicación |
|------|-----------|-----------|
| BDD | `.feature` | `/backend/src/test/resources/features/<bc>/...` |
| BDD Steps | Step defs | `/backend/src/test/java/.../bdd/steps/` |
| API | OpenAPI | `/backend/src/main/resources/openapi/<bc>/...` |
| Dominio | entidades/VOs/puertos | `/backend/src/main/java/.../domain/` |
| Aplicación | use cases | `/backend/src/main/java/.../application/` |
| Infra | adapters | `/backend/src/main/java/.../infrastructure/` |
| Controllers | REST | `/backend/src/main/java/.../infrastructure/in/rest/controller/` |
| Contratos | tests | `/backend/src/test/contracts/` (implemented, active in CI Gate 6) |
- Enormes métodos/controllers

---

# 15. DONE = deployable
Una historia está DONE solo si:
- BDD verde
- OpenAPI validado
- Dominio probado (TDD)
- Aplicación probada
- Infra probada
- Controllers conformes
- Contratos verdes
- E2E verde
- CI/CD verde
- Observabilidad mínima activa

---

# 16. Principio final
**Cada historia debe atravesar verticalmente el sistema y dejar la arquitectura más clara y protegida.**

FIN DEL DOCUMENTO
