# Implementation Plan: US1 â€” Acceso mediante cuenta de Google

**Branch**: `004-google-oauth-login`  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)  
**Data Model**: [data-model.md](./data-model.md)  
**Date**: 2026-02-25  
**Bounded Context nuevo**: `identity`  
**BCs afectados (migraciÃ³n userId)**: `meditationbuilder`, `meditation.generation`, `playback`

---

## Constitution Check

| Principio | Estado | ObservaciÃ³n |
|-----------|--------|-------------|
| BDD-First | âœ… | 5 escenarios derivados de spec.md; nada se implementa antes |
| API-First | âœ… | OpenAPI de identidad se define antes del dominio |
| Arquitectura Hexagonal | âœ… | Nuevo BC `identity` con estructura domain/application/infrastructure |
| DDD sin frameworks en dominio | âœ… | `PerfilDeUsuario` como aggregate root sin dependencias Spring |
| TDD obligatorio | âœ… | Tests de dominio antes de implementaciÃ³n |
| Controllers sin lÃ³gica | âœ… | Solo traducen protocolo â†” comandos |
| Sin endpoints fuera de BDD | âœ… | Solo C1â€“C5 derivados de los When del BDD |
| Sin business rules en BCs existentes | âœ… | Solo se migra el origen del userId en la capa de controller |

---

## Pipeline Overview

| Fase | Entregables | Depende de |
|------|-------------|------------|
| 1. BDD First | `backend/src/test/resources/features/identity/US1.feature` | â€” |
| 2. API First | `backend/src/main/resources/openapi/identity/US1.yaml` | 1 |
| 3. Domain | `com/hexagonal/identity/domain/` | 2 |
| 4. Application | `com/hexagonal/identity/application/` | 3 |
| 5. Infrastructure | `com/hexagonal/identity/infrastructure/` | 4 |
| 6. Controllers | `com/hexagonal/identity/infrastructure/in/rest/` + migraciÃ³n `shared/security` | 5 |
| 7. Frontend | `frontend/src/` (login page, auth guard, auth state, API client) | 6 |
| 8. Contracts | `backend/src/test/contracts/` | 7 |
| 9. E2E | `backend/src/test/java/.../e2e/` + `frontend/tests/e2e/` | 8 |
| 10. CI/CD | `.github/workflows/backend-ci.yml`, `frontend-ci.yml` | 9 |

---

## Fases Detalladas

### Fase 1 â€” BDD First

**Artefacto**: `backend/src/test/resources/features/identity/US1.feature`

**Contenido**: Los 5 escenarios de `spec.md` transcritos en Gherkin formal:
- Primer acceso (usuario nuevo â†’ perfil creado â†’ biblioteca vacÃ­a)
- Acceso recurrente (usuario existente â†’ perfil recuperado â†’ biblioteca con meditaciones)
- Acceso sin sesiÃ³n a ruta protegida â†’ redirecciÃ³n a login
- Cierre de sesiÃ³n â†’ sesiÃ³n destruida â†’ vuelta a login
- CancelaciÃ³n del flujo de Google â†’ vuelta a login sin error

**Step definitions**: `backend/src/test/java/com/hexagonal/identity/bdd/steps/` â€” en estado PENDING hasta Fase 6.

**Criterio de aceptaciÃ³n**: `.feature` existe y puede ejecutarse (todos los steps en `PENDING`). NingÃºn step en `UNDEFINED`.

**Prohibido**: implementar lÃ³gica en steps, tocar dominio, controllers o frontend.

---

### Fase 2 â€” API First

**Artefacto**: `backend/src/main/resources/openapi/identity/US1.yaml`

**Capacidades abstractas a modelar** (derivadas de los `When` del BDD; sin paths, mÃ©todos, ni esquemas concretos en el plan):

| Capacidad | BDD When origen |
|-----------|----------------|
| **C1** â€” Autenticar con credencial de Google y obtener sesiÃ³n propia | "selecciona su cuenta de Gmail y autoriza el acceso" |
| **C2** â€” Reconocer usuario existente y restaurar su sesiÃ³n | "selecciona la misma cuenta de Gmail" (usuario recurrente) |
| **C3** â€” Verificar que el acceso a secciones protegidas requiere sesiÃ³n activa | "intenta acceder a la biblioteca..." sin sesiÃ³n |
| **C4** â€” Invalidar la sesiÃ³n del usuario | "hace clic en Cerrar sesiÃ³n" |

> C5 (cancelar flujo de Google) es comportamiento exclusivo del frontend; no genera capacidad de backend.

**Validaciones OpenAPI**:
- Lint con Redocly CLI / Spectral (gate bloqueante en CI).
- Contiene solo los recursos y operaciones respaldados por C1â€“C4.

**Prohibido en el YAML**: paths de otros BCs, campos no derivados del BDD, schemas de objetos no relacionados con el perfil o la sesiÃ³n.

---

### Fase 3 â€” Domain (BC `identity`)

**UbicaciÃ³n**: `backend/src/main/java/com/hexagonal/identity/domain/`

**Capacidades de la capa**:
- Modelar el aggregate root `PerfilDeUsuario` con sus invariantes (ver `data-model.md`).
- Definir la regla de auto-registro: si no existe un perfil para el `identificadorGoogle` recibido, se crea uno nuevo con UUID generado.
- Definir la regla de reconocimiento: si ya existe, se devuelve el perfil existente sin modificaciÃ³n.
- Definir los puertos de entrada (use cases): autenticar con credencial de Google, cerrar sesiÃ³n.
- Definir los puertos de salida: buscar perfil por identificador Google, persistir perfil nuevo.

**Constraints del dominio**:
- Sin dependencias de Spring, sin HTTP, sin acceso a base de datos directo.
- `PerfilDeUsuario` es immutable (patrones record / Java 21).
- Clock inyectado para `creadoEn`.

**Testing**: TDD â€” tests de dominio en rojo antes de implementar, en verde al terminar la fase.

---

### Fase 4 â€” Application (BC `identity`)

**UbicaciÃ³n**: `backend/src/main/java/com/hexagonal/identity/application/`

**Capacidades de la capa**:
- Use case de autenticaciÃ³n: valida la credencial de Google (delegando al puerto de salida de validaciÃ³n), obtiene o crea el `PerfilDeUsuario`, genera el token de sesiÃ³n propio.
- Use case de cierre de sesiÃ³n (si aplica estado de tokenlistnegra): invalida el token de sesiÃ³n.
- OrquestaciÃ³n pura â€” sin reglas de negocio propias.

**Prohibido**: lÃ³gica de negocio que pertenezca al dominio. La application solo coordina.

---

### Fase 5 â€” Infrastructure (BC `identity`)

**UbicaciÃ³n**: `backend/src/main/java/com/hexagonal/identity/infrastructure/`

**Adaptadores de salida**:
- Adaptador de persistencia: implementa el puerto de bÃºsqueda y persistencia de `PerfilDeUsuario` contra la tabla `identity.users` en PostgreSQL.
- Adaptador de validaciÃ³n de credencial de Google: implementa el puerto de validaciÃ³n del `id_token` contra las claves pÃºblicas de Google (JWKS).
- Adaptador de emisiÃ³n de token de sesiÃ³n propio: implementa el puerto de generaciÃ³n del JWT interno que identifica la sesiÃ³n del usuario.

**Subcapa `shared/security`** (transversal, no es parte del BC `identity`):
- Filtro de seguridad que extrae el `userId` del JWT de sesiÃ³n propio y lo pone disponible en el contexto de cada peticiÃ³n autenticada.
- Reemplaza el mecanismo actual de `X-User-Id` header en los controllers de `meditationbuilder`, `meditation.generation` y `playback`.

**Testing**: tests de integraciÃ³n para el adaptador de persistencia (Testcontainers + PostgreSQL). El adaptador de Google se prueba con servicio simulado.

---

### Fase 6 â€” Controllers

**UbicaciÃ³n**: `backend/src/main/java/com/hexagonal/identity/infrastructure/in/rest/`

**Capacidades**:
- Controller de autenticaciÃ³n: recibe la credencial de Google del frontend, invoca el use case de autenticaciÃ³n, devuelve el token de sesiÃ³n propio.
- Controller de cierre de sesiÃ³n: invoca el use case de cierre de sesiÃ³n.
- Sin lÃ³gica de negocio â€” solo traducciÃ³n protocolo â†” use case.

**MigraciÃ³n de BCs existentes**:
- Los controllers de `meditationbuilder`, `meditation.generation` y `playback` pasan de leer `X-User-Id` del header a leer el `userId` del principal autenticado (inyectado por el filtro de `shared/security`).
- El cambio es Ãºnicamente en la capa de controller de cada BC; dominio y application no se modifican.

**Step definitions BDD**: en esta fase se implementan los steps pendientes de la Fase 1 para que el BDD pase a VERDE.

---

### Fase 7 â€” Frontend

**Artefactos en** `frontend/src/`:

**PÃ¡gina de login** (`pages/`):
- Pantalla de bienvenida con el botÃ³n "Iniciar sesiÃ³n con Google".
- Comportamientos: botÃ³n llama a la capacidad C1; cancelaciÃ³n (C5) regresa sin error.

**Guardia de ruta** (`components/` o `pages/`):
- Redirecciona al login si no hay sesiÃ³n activa (C3).
- Envuelve las rutas protegidas (`/library`, `/create`).

**Estado de autenticaciÃ³n** (`state/`):
- Slice Zustand que almacena la sesiÃ³n del usuario: token de sesiÃ³n, nombre, foto. 
- No almacena datos de servidor (meditaciones, etc.) â€” esos siguen en React Query.

**Cliente OpenAPI generado** (`api/generated/identity/`):
- Generado desde `US1.yaml` mediante `npm run generate:api`.
- Wrapper (`api/identity-client.ts`) que encapsula las capacidades C1 y C4.

**Cabecera de la aplicaciÃ³n** (componente existente o nuevo):
- Cuando hay sesiÃ³n: muestra nombre, foto y enlace "Cerrar sesiÃ³n" (C4).
- Cuando no hay sesiÃ³n: no se renderiza (el usuario estÃ¡ en `/login`).

**IntegraciÃ³n con BCs existentes**:
- `API_BASE_URL` y la configuraciÃ³n de todos los clientes API pasan de enviar `X-User-Id` a enviar el `Authorization: Bearer <token>` extraÃ­do del estado de autenticaciÃ³n.

**Prohibido**: lÃ³gica de negocio en componentes, llamadas HTTP directas sin pasar por el cliente OpenAPI.

---

### Fase 8 â€” Contract Tests

**UbicaciÃ³n**: `backend/src/test/contracts/`

**Alcance**:
- Tests provider/consumer que validan que los controllers del BC `identity` cumplen el contrato descrito en `US1.yaml`.
- ValidaciÃ³n de que el filtro de seguridad en los BCs existentes acepta el JWT propio y proporciona el `userId` correcto.

---

### Fase 9 â€” E2E

**Backend** (`backend/src/test/java/.../e2e/`):
- Flujo completo: credencial simulada â†’ autenticaciÃ³n â†’ JWT â†’ acceso a recurso protegido.
- Flujo de cierre de sesiÃ³n â†’ acceso a recurso protegido rechazado.

**Frontend** (`frontend/tests/e2e/`):
- Flujo login completo con Google mockeado (no se llama a Google real en CI).
- Acceso a `/library` sin sesiÃ³n â†’ redirecciÃ³n a `/login`.
- Cierre de sesiÃ³n â†’ vuelta al login.
- Recarga de pÃ¡gina â†’ sesiÃ³n restaurada si el token aÃºn es vÃ¡lido.

---

### Fase 10 â€” CI/CD

**Backend CI** (`.github/workflows/backend-ci.yml`) â€” gates en orden:
1. BDD (Cucumber) â€” incluye los escenarios de `identity`
2. API Verification â€” lint del nuevo `US1.yaml`
3. Unit Tests â€” domain + application del BC `identity`
4. Integration Tests â€” adaptador de persistencia con Testcontainers
5. Contract Tests
6. E2E Backend
7. Build (JAR)

**Frontend CI** (`.github/workflows/frontend-ci.yml`) â€” gates en orden:
1. Setup + Java 21 (para generaciÃ³n de cliente OpenAPI)
2. API Generation â€” `npm run generate:api` incluye el nuevo cliente `identity`
3. Lint & Type Check
4. Unit & Integration Tests (Vitest + MSW) â€” mock de la API de identidad
5. E2E Playwright â€” flujo de login mockeado
6. Build

---

## Re-evaluaciÃ³n Constitution Check (post-diseÃ±o)

| ComprobaciÃ³n | Estado | Detalle |
|---|---|---|
| Nuevo BC cumple estructura hexagonal | âœ… | domain / application / infrastructure bien separados |
| Sin BDD â†’ sin implementaciÃ³n | âœ… | Todos los artefactos trazados a los 5 escenarios |
| MigraciÃ³n de BCs existentes acotada | âœ… | Solo controllers + shared/security; dominio intacto |
| Sin endpoints fuera de C1â€“C4 | âœ… | C5 es frontend-only, no genera API |
| OpenAPI validado antes del dominio | âœ… | Fase 2 precede a Fase 3 |
| Frontend sin lÃ³gica de negocio | âœ… | Auth guard y estado: solo UI-state |
| NEEDS CLARIFICATION: 0 pendientes | âœ… | Todos resueltos en research.md |

---

## Definition of Done

- [ ] 5 escenarios BDD del BC `identity` en VERDE
- [ ] `US1.yaml` validado con lint sin errores
- [ ] Domain TDD completo (tests en verde antes de infrastructure)
- [ ] Adaptador de persistencia probado con integraciÃ³n real (Testcontainers)
- [ ] Controllers de los 3 BCs existentes migrados a JWT (sin romper sus BDD ni E2E existentes)
- [ ] Frontend: login page, auth guard, auth state, cliente OpenAPI actualizados
- [ ] Todos los clientes API del frontend envÃ­an `Authorization: Bearer` en lugar de `X-User-Id`
- [ ] E2E backend y frontend en verde
- [ ] Todos los gates de CI/CD en verde para backend y frontend
- [ ] Sin deuda crÃ­tica
