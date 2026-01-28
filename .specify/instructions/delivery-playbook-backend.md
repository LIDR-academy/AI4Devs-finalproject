
# 🧭 Backend Delivery Playbook — Meditation Builder
**Versión:** 2.0.0 (Reescritura completa, alineada con Constitución)
**Ámbito:** `/backend` – Microservicio Java 21 + Spring Boot + Arquitectura Hexagonal

---

# 0. Propósito del Playbook
Este documento define **cómo debe entregarse cualquier Historia de Usuario** en el backend del proyecto Meditation Builder.

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
    ports/
       in/
       out/
  infrastructure/
    in/
      kafka/
      rest/
        controller/
        dto/
        mapper/
    out/
      kafka/
      mongodb/
        impl/
        mapper/
        model/
        repository/
      service/
shared/
  errorhandler/
    dto/
    enums/
    exception/
  kafka/
  observability/
  openapi/
  security/
  utils/
```

## 2.2 OpenAPI
```
/backend/src/main/resources/openapi/
/backend/src/main/resources/openapi/common/
/backend/src/main/resources/openapi/<boundedContext>/
```

## 2.3 Testing backend
```
/backend/src/test/bdd/...
/backend/src/test/contracts/...
/backend/src/test/e2e/...
/backend/src/test/java/... (unit + integration)
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
9) CI/CD gates
10) Done = deployable
```

---

# 4. Fase 1 — BDD FIRST
## Entregables mínimos:
- Archivo `.feature` en `/backend/src/test/bdd/<context>/<feature>.feature`
- Escenarios Given–When–Then orientados a negocio
- Step definitions pending

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

# 12. Fase 9 — CI/CD (gates bloqueantes)
Pipeline estricto:
```
bdd → api → unit → infra → contract → e2e → build → deploy
```

---

# 13. Artefactos obligatorios por fase
| Fase | Artefacto | Ubicación |
|------|-----------|-----------|
| BDD | `.feature` | `/backend/src/test/bdd/...` |
| API | OpenAPI | `/backend/src/main/resources/openapi/...` |
| Dominio | entidades/VOs/puertos | `/backend/.../domain` |
| Aplicación | use cases | `/backend/.../application` |
| Infra | adapters | `/backend/.../infrastructure` |
| Controllers | REST | `/backend/.../rest/controller` |
| Contratos | tests | `/backend/src/test/contracts` |
| E2E | cucumber | `/backend/src/test/e2e` |

---

# 14. Anti‑patrones prohibidos
- Lógica negocio fuera de dominio
- Endpoints no definidos en BDD
- Saltarse TDD
- Usar servicios cloud reales en tests
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
