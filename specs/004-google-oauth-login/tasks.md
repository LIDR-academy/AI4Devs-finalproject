# Tasks: Google OAuth Login (US1)

**Branch**: `004-google-oauth-login`  
**Inputs**: ./plan.md · ./spec.md · ./data-model.md · ./research.md  
**Bounded Context nuevo**: `identity`  
**BCs migrados**: `meditationbuilder` · `meditation.generation` · `playback`  
**Total tareas**: 16 (feature compleja, un BC nuevo + migración de 3 BCs)

---

## Formato de tarea
`- [ ] [ID] [P?] [US1] Título — descripción`

- **[P]** = paralelizable (ficheros distintos, sin dependencia de tarea incompleta)
- Paths a nivel de plantilla (`features/${bc}/...`), no clases individuales
- Una tarea por capa; máximo 2 si la capa tiene partes independientes

---

## Phase 1 — BDD First

- [x] T001 [US1] BDD — Crear `features/identity/US1.feature` con los 5 escenarios de spec.md (primer acceso, recurrente, ruta protegida, cierre de sesión, cancelación) + step definitions en `${basePackage}/identity/bdd/steps/` en estado PENDING. **Criterio**: `mvn test -Dcucumber.filter.tags=@identity` ejecuta sin UNDEFINED steps.

---

## Phase 2 — API First

- [x] T002 [US1] OpenAPI — Definir `openapi/identity/US1.yaml` con las 4 capacidades del backend (C1: autenticar con Google, C2: reconocer usuario existente, C3: proteger rutas no autenticadas → 401, C4: cerrar sesión). Sin desvíos respecto a los When del BDD. **Criterio**: lint Redocly/Spectral sin errores; ningún path fuera de C1–C4.

---

## Phase 3 — Domain

- [x] T003 [US1] Domain — Implementar aggregate root `PerfilDeUsuario` como Java record (id UUID, identificadorGoogle, correo, nombre, urlFoto, creadoEn con Clock inyectado) + invariantes (unicidad por identificadorGoogle, inmutabilidad) + puertos in (`AutenticarConGooglePort`, `CerrarSesionPort`) + puertos out (`BuscarPerfilPorGoogleIdPort`, `PersistirPerfilPort`, `ValidarCredencialGooglePort`, `EmitirTokenSesionPort`). Sin dependencias Spring. **Criterio**: tests unitarios de dominio en verde; build sin imports de frameworks.

---

## Phase 4 — Application

- [x] T004 [US1] Application — Implementar `IniciarSesionConGoogleUseCase` (valida credencial → busca o crea PerfilDeUsuario → emite token de sesión) y `CerrarSesionUseCase` (invalida token). Orquestación pura vía los puertos de salida. **Criterio**: tests unitarios con mocks de todos los ports out; sin lógica de negocio en esta capa.

---

## Phase 5 — Infrastructure

- [x] T005 [US1] Infra — Adapters out del BC `identity`: persistencia de PerfilDeUsuario en tabla `identity.users` (PostgreSQL), validación del `id_token` de Google via JWKS (Spring Security OAuth2 Resource Server), emisión del JWT de sesión propio (clave configurable por env). Tests de integración del adaptador de persistencia con Testcontainers. Adaptador Google probado con servicio simulado. **Paths**: `${basePackage}/identity/infrastructure/out/`. **Criterio**: tests de integración en verde; ninguna lógica de negocio en adaptadores.

- [x] T006 [P] [US1] Infra shared/security — Implementar filtro de seguridad transversal en `${basePackage}/shared/security/` que extrae el `userId` del JWT de sesión propio y lo inyecta en el `SecurityContext` de cada petición autenticada. Reemplaza el mecanismo `X-User-Id` en los controllers de los 3 BCs existentes (ver T008). **Criterio**: filtro probado con token válido, inválido y ausente; no modifica dominio ni application de los BCs existentes.

---

## Phase 6 — Controllers

- [x] T007 [US1] Controllers  identity — Implementar `AuthController` en `${basePackage}/identity/infrastructure/in/rest/` (endpoint autenticación C1/C2 + logout C4). Solo traduce protocolo ↔ use cases. Completar step definitions BDD para que los 5 escenarios de T001 pasen a VERDE. **Criterio**: BDD tag `@identity` en verde; contrato cumple `US1.yaml`; sin lógica de negocio en el controller.

- [x] T008 [P] [US1] Migración controllers existentes — En los controllers de `meditationbuilder`, `meditation.generation` y `playback`: sustituir lectura del header `X-User-Id` por extracción del `userId` desde el `SecurityContext` (inyectado por el filtro T006). Solo se toca la capa de controller; dominio y application no cambian. **Criterio**: tests de los 3 BCs existentes en verde; header `X-User-Id` eliminado de toda la capa de entrada.

- [X] T008b [P] [US1] Migración BDD test infrastructure — Actualizar las 3 `*CucumberSpringConfiguration` (`PlaybackCucumberSpringConfiguration`, `CucumberSpringConfiguration`, `CompositionCucumberSpringConfiguration`) y sus step definitions para usar JWT Bearer en lugar de `X-User-Id`/`X-Test-User-Id`: añadir `@MockBean ValidarCredencialGooglePort` en cada config, obtener JWT real vía `POST /v1/identity/auth/google` en `@Before`, registrar el token como `RestAssured.requestSpecification`, eliminar headers obsoletos en `PlaybackSteps` y `GenerateMeditationSteps`. Añadir `@After RestAssured.reset()` en la config de Generation para evitar contaminación de estado estático entre suites. **Paths**: `backend/src/test/java/.../bdd/`. **Criterio**: Gate 1 CI (`mvn test -Dtest="**/*BDD*..."`) con 18 escenarios en verde; `X-Test-User-Id` y `X-User-ID` eliminados de todos los step definitions.

---

## Phase 7 — Frontend

- [x] T009 [US1] Frontend auth state + login — Implementar `authStore` (Zustand, en `frontend/src/state/`) con token, nombre y foto del usuario + página `LoginPage` (`frontend/src/pages/`) con botón `@react-oauth/google` que invoca C1/C5 → Actualizar `App.tsx` con rutas protegidas vía `AuthGuard` (`frontend/src/components/`) que redirige a `/login` si no hay sesión activa (C3). **Criterio**: rendering de LoginPage sin sesión; redirect a `/login` al acceder a `/library` sin token.

- [x] T010 [P] [US1] Frontend cliente API + cabecera — Generar cliente OpenAPI de `identity` (`npm run generate:api` → `frontend/src/api/generated/identity/`) + wrapper `identity-client.ts` para C1 y C4 + Actualizar todos los clientes API existentes para enviar `Authorization: Bearer <token>` en lugar de `X-User-Id` + cabecera de la aplicación con nombre, foto y enlace "Cerrar sesión" (C4) cuando hay sesión activa. **Criterio**: `npm run generate:api` sin errores; header `X-User-Id` eliminado de todos los clientes frontend; cabecera renderiza datos del perfil.

---

## Phase 8 — Contracts

- [X] T011 [P] [US1] Contract tests — Tests provider/consumer contra `openapi/identity/US1.yaml`: verificar que `AuthController` honra exactamente el contrato (C1, C2, C4). Validar también que el filtro `shared/security` acepta el JWT propio y proporciona el `userId` correcto a los otros BCs. **Paths**: `backend/src/test/contracts/`. **Criterio**: todos los contract tests en verde; ninguna desviación del contrato OpenAPI.

---

## Phase 9 — E2E

- [X] T012 [US1] E2E backend — Flujo completo con credencial de Google simulada: autenticación → JWT → acceso a recurso protegido de un BC existente. Flujo de cierre de sesión → intento de acceso rechazado (401). **Paths**: `${basePackage}/identity/e2e/`. **Criterio**: todos los escenarios E2E backend en verde.

- [X] T013 [P] [US1] E2E frontend (Playwright) — Cubrir los 5 escenarios BDD con Google mockeado (sin llamadas reales a Google en CI): login nuevo → biblioteca vacía; login recurrente → biblioteca con meditaciones; acceso a `/library` sin sesión → `/login`; cierre de sesión → pantalla de acceso; cancelación del flujo Google → pantalla de acceso sin error. **Paths**: `frontend/tests/e2e/`. **Criterio**: todos los tests Playwright en verde en chromium; `npm run test:e2e` sin fallos.

- [X] T012b [P] [US1] Migración E2E backend test infrastructure — Actualizar los 3 tests E2E de los BCs existentes (`ManualCompositionE2ETest`, `AiGenerationE2ETest`, `GenerateMeditationE2ETest`) para usar JWT Bearer en lugar de llamadas no autenticadas o del header obsoleto `X-Test-User-Id`: añadir `@MockBean ValidarCredencialGooglePort` en cada clase, obtener JWT real vía `POST /v1/identity/auth/google` en `@BeforeEach`, registrar el token como `RestAssured.requestSpecification`, eliminar `X-Test-User-Id` en `GenerateMeditationE2ETest`, y añadir `@AfterEach RestAssured.reset()` en las 3 clases. **Paths**: `backend/src/test/java/.../meditationbuilder/e2e/`, `backend/src/test/java/.../meditation/generation/e2e/`. **Criterio**: Gate 7 CI (`mvn test -Dtest="**/*E2ETest*"`) con 19 tests en verde; `X-Test-User-Id` eliminado de todos los E2E backends; `ManualCompositionE2ETest` 5/5, `AiGenerationE2ETest` 7/7, `GoogleAuthE2ETest` 4/4, `GenerateMeditationE2ETest` 3/3.

---

## Phase 10 — CI/CD

- [X] T014 [US1] CI/CD — Actualizar `.github/workflows/backend-ci.yml`: añadir `GOOGLE_CLIENT_ID` como env var, incluir BDD tag `@identity` en gate 1 y lint de `US1.yaml` en gate 2. Actualizar `.github/workflows/frontend-ci.yml`: añadir `VITE_GOOGLE_CLIENT_ID` como env var/secret, verificar que gate 2 (`npm run generate:api`) incluye el cliente `identity`, añadir los tests E2E del flujo de login al gate 5. Eliminar `VITE_USER_ID` de ambos workflows. **Criterio**: todos los gates de ambos CI en verde; ningún valor hardcodeado de userId en workflows.

---

## Dependency Graph

```
T001 (BDD)
  └─► T002 (API)
        └─► T003 (Domain)
              └─► T004 (Application)
                    └─► T005 (Infra adapters)
                    └─► T006 [P] (Infra shared/security)
                          └─► T007 (Controllers identity) ──► T001 BDD verde
                          └─► T008 [P] (Migración controllers)
                                └─► T009 (Frontend auth/login)
                                └─► T010 [P] (Frontend API client)
                                      └─► T011 [P] (Contracts)
                                            └─► T012 (E2E backend)
                                            └─► T013 [P] (E2E frontend)
                                                  └─► T014 (CI/CD)
```

**Paralelizable una vez desbloqueadas sus dependencias**: T006 ‖ T005, T008 ‖ T007, T010 ‖ T009, T013 ‖ T012

---

## MVP Scope

Tareas mínimas para que el login funcione end-to-end en local:

| Tarea | Qué habilita |
|---|---|
| T001 | BDD definido (contrato de comportamiento) |
| T002 | Contrato API definido |
| T003 | Dominio con reglas de auto-registro e immutabilidad |
| T004 | Orquestación del flujo login/logout |
| T005 | Persistencia + validación Google + emisión JWT |
| T006 | Filtro JWT transversal |
| T007 | Endpoint de auth funcional + BDD verde |
| T008 | Los 3 BCs existentes leen userId del JWT |
| T009 | Login page + rutas protegidas en frontend |
| T010 | Cliente API actualizado (envía Bearer en lugar de X-User-Id) |

Las tareas T011–T014 (contracts, E2E, CI/CD) son necesarias para el gate de entrega pero no bloquean la funcionalidad local.

---

## Independent Test Criteria por tarea

| Tarea | Cómo se valida de forma aislada |
|---|---|
| T001 | `mvn test -Dcucumber.filter.tags=@identity` → todos PENDING, ninguno UNDEFINED |
| T002 | `npx redocly lint openapi/identity/US1.yaml` sin errores |
| T003 | `mvn test -pl backend -Dtest=**/identity/domain/**` → 100% verde |
| T004 | `mvn test -pl backend -Dtest=**/identity/application/**` → 100% verde |
| T005 | `mvn failsafe:integration-test -Dtest=**/identity/infrastructure/out/**` con Testcontainers |
| T006 | Tests unitarios del filtro con JWT válido/inválido/ausente |
| T007 | `mvn test -Dcucumber.filter.tags=@identity` → 5/5 VERDE |
| T008 | Tests de los 3 BCs existentes en verde sin header `X-User-Id` |
| T008b | `mvn test -Dtest="**/*BDD*..."` → 18 escenarios BDD verde; no `X-Test-User-Id` ni `X-User-ID` en step defs |
| T009 | `npm run test` → LoginPage y AuthGuard renderización; redirect sin token |
| T010 | `npm run generate:api` OK; ningún cliente envía `X-User-Id` |
| T011 | `mvn failsafe:integration-test -Dtest=**/contracts/**` → verde |
| T012 | `mvn failsafe:integration-test -Dtest=**/identity/e2e/**` → verde |
| T012b | `mvn test -Dtest="**/*E2ETest*"` → 19 tests E2E backend verde; no `X-Test-User-Id` en `GenerateMeditationE2ETest` |
| T013 | `npm run test:e2e` → 5 escenarios Playwright verde en chromium |
| T014 | CI pipeline completo en verde; `VITE_USER_ID` ausente de workflows |
