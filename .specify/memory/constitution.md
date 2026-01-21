
# Project Constitution — Meditation Builder  
**Versión: 2.0.0 (Reescrita y Extendida)**  
**Ubicación:** `.specify/memory/constitution.md`  
**Ámbito:** Backend (Java 21 + Spring Boot) y Frontend (React + TS)

---

# 0. Propósito
Esta constitución es la **norma superior** del proyecto *Meditation Builder*.  
Define la arquitectura, el flujo de trabajo, la jerarquía normativa, los principios de calidad, y las reglas de comportamiento obligatorias para:

- Personas desarrolladoras  
- QA y analistas  
- IA generativa (Claude 4.5 Sonnet, GitHub Copilot, Spec‑Kit)  

Su objetivo es garantizar:

- Diseños claros y evolutivos  
- Historias verticales que generen valor  
- Código consistente y testeable  
- Alta calidad y trazabilidad  
- Entregas repetibles sin deuda técnica

---

# 1. Jerarquía normativa (orden absoluto)
En caso de conflicto, se debe obedecer estrictamente este orden:

1. **Historia de Usuario + BDD (`.feature`)**  
2. **Delivery Playbook Backend / Frontend**  
3. **Engineering Guidelines**  
4. **Hexagonal Architecture Guide**  
5. **Copilot Instructions (`.github`)**  
6. **Instrucciones operativas (`.specify/instructions`)**  
7. **Frameworks (Spring / React / Vite / Playwright)**  
8. Preferencias individuales o de equipo (no vinculantes)

⚠️ **Si un comportamiento NO está definido en BDD → NO se implementa.**  
⚠️ **No se admiten rutas, DTOs o reglas extra no justificadas.**

---

# 2. Principios fundamentales
## 2.1 Specifications-Driven Development (SDD)
Toda implementación nace de:

- Historia de Usuario  
- Escenarios escritos en Given–When–Then  
- Aprobados por PO + QA + Backend + Frontend

El código es una **materialización técnica** de un comportamiento ya acordado.

## 2.2 Arquitectura base (ambos lados)
### Backend:
- **Java 21 + Spring Boot**  
- **Arquitectura Hexagonal rígida**  
- **DDD táctico**  
- **TDD obligatorio en dominio**  
- **API First mínimo**

### Frontend:
- **React + TypeScript**  
- **React Query + Zustand**  
- **OpenAPI Client autogenerado**  
- **Playwright E2E**

---

# 3. Estructura del repositorio (monorepo)
El proyecto tiene dos módulos principales:
...
/backend and /frontend structure and all details

/backend
/frontend

Cada uno con sus propias responsabilidades, tests y pipelines.

---
# 4. Estructura backend (normativa)
Toda lógica backend vive bajo:

```
/backend/src/main/java/com/hexagonal/
```

## 4.1 Bounded context (ejemplo: meditationbuilder)
```
com/hexagonal/meditationbuilder/
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

## 4.2 OpenAPI (API First)
```
/backend/src/main/resources/openapi/
    common/
    <boundedContext>/
```

## 4.3 Testing backend
```
/backend/tests/bdd/...
/backend/tests/contracts/...
/backend/tests/e2e/...
/backend/src/test/java/... (unit + integration)
```

---
# 5. Estructura frontend (normativa)
```
/frontend
    /src
        /api
        /components
        /pages
        /state
        /hooks
        /styles
    /tests
        /unit
        /integration
        /e2e
```
El frontend no contiene lógica de negocio.

---
# 6. Ciclo de vida por historia (orden estricto e inmutable)

Cada Historia debe recorrer todas estas fases —**sin saltos, sin paralelismos indebidos y sin mezclar capas**.  
Este pipeline está sincronizado con **Spec‑Kit (spec → plan → tasks)** y con el **Delivery Playbook**.

---

## 6.1 Paso 0 — Historia candidata (Three Amigos pre‑BDD)

**Responsables:** PO + QA + Backend + Frontend  

**Objetivo:** Asegurar que la historia es:

- Vertical (aporta valor observable)
- Pequeña
- Testeable
- Independiente
- Con límites claros

> No se diseña nada técnico aún.

---

## 6.2 Paso 1 — BDD FIRST (única fuente de verdad del comportamiento)

**Responsables:** PO (input negocio), QA (dueño calidad), Backend + Frontend (colaboran)

### Artefactos
- Archivo `.feature` en  
  `/backend/tests/bdd/<context>/<feature>.feature`
- Escenarios **Given–When–Then** en lenguaje **100% negocio**
- Step definitions vacíos (*pending*)

### Reglas
- Sin HTTP, JSON, DTOs, repositorios, colas ni UI
- El BDD define solo comportamiento observable
- Cucumber debe ejecutar en **ROJO (pending)** inicialmente
- Nada se implementa hasta que el `.feature` exista

---

## 6.3 Paso 2 — API FIRST mínimo (derivado exclusivamente del BDD)

**Responsables:** Backend (owner), Frontend + QA (consumidores)

### Artefactos
- OpenAPI YAML en  
  `/backend/src/main/resources/openapi/<boundedContext>/<feature>.yaml`
- Validado con lint

### Reglas
- Cada `When` del BDD corresponde a una capacidad expuesta
- Prohibido añadir campos o endpoints no contemplados en el comportamiento
- El contrato sirve al negocio, **NO** al dominio ni al UI
- Tests provider/consumer (contratos)

---

## 6.4 Paso 3 — Dominio (DDD + TDD puro)

**Responsables:** Backend (dominio)

### Artefactos
- Entidades
- Value Objects
- Puertos (in/out)
- Servicios de dominio (si aplican)
- Tests unitarios (TDD)

### Ubicación
`/backend/src/main/java/com/hexagonal/<bc>/domain/...`

### Reglas
- Sin Spring, sin infraestructura, sin JSON
- El dominio piensa en negocio, no en HTTP
- TDD obligatorio (test → código → refactor)

---

## 6.5 Paso 4 — Aplicación (Use Cases)

**Responsables:** Backend (aplicación)

### Artefactos
- Use cases
- Comandos / queries
- Mappers internos
- Validadores simples
- Unit tests (solo orquestación)

### Ubicación
`/backend/src/main/java/com/hexagonal/<bc>/application/...`

### Reglas
- Sin reglas de negocio (esas están en dominio)
- Sin acceso a infraestructura
- Asociado 1:1 con puertos de dominio

---

## 6.6 Paso 5 — Infraestructura (Adaptadores)

**Responsables:** Backend (infra)

### Artefactos
- Adaptadores externos (DB, IA, colas, APIs, storage)
- Modelos de persistencia
- Mappers persistencia ↔ dominio
- Tests de integración (Testcontainers si aplica)

### Ubicación
`/backend/src/main/java/com/hexagonal/<bc>/infrastructure/...`

### Reglas
- Implementan puertos out
- Sin lógica de negocio
- No contaminan dominio con tipos de framework

---

## 6.7 Paso 6 — Controllers / REST Adapters

**Responsables:** Backend (entrada)

### Artefactos
- Controllers REST
- DTOs
- Validaciones superficiales

### Ubicación
`/backend/src/main/java/com/hexagonal/<bc>/infrastructure/in/rest/controller`

### Reglas
- Cumplimiento estricto del OpenAPI
- No lógica de negocio
- No decisiones
- Solo traducción protocolo ↔ comando use case

---

## 6.8 Paso 7 — Frontend (UI + cliente + estado)

**Responsables:** Frontend

### Artefactos
- Páginas (`/frontend/src/pages/...`)
- Componentes (`/frontend/src/components/...`)
- Hooks
- Estado (Zustand)
- Cliente OpenAPI autogenerado (`/frontend/src/api/...`)
- Tests unitarios + integración

### Reglas
- Sin lógica de negocio
- API Client siempre autogenerado
- React Query para server-state
- Estado global solo si es UI/state
- Mantener fusión mínima entre UI ↔ backend

---

## 6.9 Paso 8 — Contratos (provider/consumer)

**Responsables:** Backend + QA

### Artefactos
- Tests contractuales en `/backend/tests/contracts/...`

### Reglas
- El backend debe cumplir su OpenAPI
- El frontend debe ejecutar contra mocks generados del YAML
- Un cambio en OpenAPI rompe si contratos fallan

---

## 6.10 Paso 9 — E2E (Backend + Frontend)

**Responsables:** QA + Frontend + Backend

### Artefactos
- Playwright E2E: `/frontend/tests/e2e/...`
- Cucumber BDD sobre backend real: `/backend/tests/e2e/...`

### Reglas
- Validación del comportamiento completo
- Sin mocks de infraestructura crítica
- Validación en entorno real o contenedores

---

## 6.11 Paso 10 — CI/CD Gates (bloqueantes)

### Pipeline
- bdd
- api
- unit (dominio + aplicación)
- infra (integración)
- contract
- e2e backend
- e2e frontend
- Build artefacto
- Deploy a entorno superior

### Reglas
- Ningún fallo permite merge
- Build once, deploy many
- Artefacto inmutable

---

## 6.12 Paso 11 — Done = Deployable

Una historia solo está DONE si:

- BDD verde
- OpenAPI validado
- Dominio testado por TDD
- Aplicación testada
- Infra testada
- Controllers conformes a contrato
- Frontend integrado y probado
- Playwright verde
- CI/CD verde
- Observabilidad mínima
- No deuda técnica
- Nada fuera del BDD

---
# 7. Artefactos obligatorios
| Fase | Artefacto | Ubicación |
|------|-----------|-----------|
| BDD | .feature | /backend/tests/bdd/... |
| API | OpenAPI | /backend/src/main/resources/openapi/... |
| Dominio | entidades, VOs | /backend/src/main/java/.../domain/... |
| Aplicación | use cases | /backend/.../application/usecases/... |
| Infra | adapters | /backend/.../infrastructure/... |
| Controllers | REST | /backend/.../infrastructure/in/rest/controller |
| Frontend | UI | /frontend/src/... |
| Contratos | contract tests | /backend/tests/contracts/ |
| E2E | Playwright | /frontend/tests/e2e |
| CI/CD | workflows | .github/workflows |

---
# 8. Normas para agentes
- spec.md solo narrativa y BDD
- plan.md pipeline
- tasks.md por capa
- rutas exactas
- no introducir nada externo
- no mezclar capas

---
# 9. Conformidad técnica
Backend: Java 21, Spring Boot, RestClient/WebClient, JUnit5, Mockito, Testcontainers, Cucumber
Frontend: React18, TS, React Query, Zustand, Jest/Vitest, RTL, Playwright

---
# 10. Observabilidad y no funcionales
Logs estructurados, métricas, trazas, retries, CB, timeouts, build once deploy many

---
# 11. Antipatrones
Diseño horizontal, lógica negocio fuera de dominio, endpoints sin BDD, tests externos reales, modelos dios

---
# 12. Done
BDD verde, OpenAPI validado, dominio TDD, aplicación probada, infra probada, controllers conformes, frontend integrado, playwright verde, CI/CD verde, observabilidad ok

---
# 13. Governance
Cambios requieren PR y consenso.

---
# 14. Principio final
Cada historia atraviesa el sistema verticalmente.