---
description: "Task list for feature implementation"
---

# Tasks: Portal de Verificación de Certificados

**Input**: Design documents from `specs/007-portal-verificacion/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluidos (TDD obligatorio — constitución VIII + plan Technical Context + assumption de spec). Ciclo Red → Green → Refactor. Sin cambios al microservicio `verificacion-*`, sin Cognito/MAUC, sin PrimeNG/Tailwind.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario (US1, US2, US3, US4)
- Rutas relativas a la raíz del repositorio

## Path Conventions

- App: `frontend/portal-verificacion/`
- Feature: `frontend/portal-verificacion/src/app/features/verificacion/`
- Core HTTP: `frontend/portal-verificacion/src/app/core/http/`
- Environments: `frontend/portal-verificacion/src/environments/`
- Estilos CCB (ya portados): `frontend/portal-verificacion/src/styles/ccb/`
- Contratos: `specs/007-portal-verificacion/contracts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencia del visor, environments de API y esqueleto de carpetas/rutas del feature sobre el scaffold existente (shell CCB ya presente).

- [X] T001 Añadir dependencia `pdfjs-dist` en `frontend/portal-verificacion/package.json` (y lockfile vía `npm install` en ese directorio); no añadir PrimeNG ni Tailwind
- [X] T002 [P] Crear `frontend/portal-verificacion/src/environments/environment.ts` y `environment.development.ts` con `apiBaseUrl` (prod: host público verificacion; dev: `http://localhost:8083`) y cablear fileReplacements / `angular.json` si hace falta
- [X] T003 [P] Crear esqueleto de feature: `frontend/portal-verificacion/src/app/features/verificacion/verificacion.routes.ts` (ruta `''` → componente placeholder o stub) y directorio `pdf-viewer/`; dejar archivos vacíos/stub solo si hacen falta para compilar
- [X] T004 Configurar lazy load en `frontend/portal-verificacion/src/app/app.routes.ts`: path `''` → `loadChildren`/`loadComponent` hacia `features/verificacion/verificacion.routes.ts` (o componente); asegurar `routerLink="/"` del shell en `app.html` resuelve al feature

**Checkpoint**: `npm start` en `frontend/portal-verificacion` sirve el shell CCB y carga la ruta lazy del feature sin errores de build.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: HttpClient público (sin JWT), correlation id, modelos API del envelope y wiring de `app.config`. **Bloquea** todas las user stories.

**⚠️ CRITICAL**: No iniciar US1–US4 hasta completar esta fase.

### Tests foundational (TDD — escribir primero) ⚠️

- [X] T005 [P] Unit test Red `correlation-id.interceptor.spec.ts` en `frontend/portal-verificacion/src/app/core/http/correlation-id.interceptor.spec.ts`: añade header `X-Correlation-Id` si ausente; no toca Authorization — debe fallar hasta T007

### Implementation foundational

- [X] T006 Crear modelos de cliente alineados a `contracts/client-api-verificaciones.md` en `frontend/portal-verificacion/src/app/features/verificacion/verificacion-api.models.ts` (`ApiResponse<T>`, payloads validar/documento/registros, códigos de error UX)
- [X] T007 Implementar interceptor funcional `correlationIdInterceptor` en `frontend/portal-verificacion/src/app/core/http/correlation-id.interceptor.ts`; Green T005
- [X] T008 Registrar en `frontend/portal-verificacion/src/app/app.config.ts`: `provideHttpClient(withInterceptors([correlationIdInterceptor]))` — **sin** interceptor de Authorization/Cognito; importar `provideRouter` ya existente

**Checkpoint**: HttpClient + correlation id listos; `apiBaseUrl` en environments; sin auth. User stories pueden empezar.

---

## Phase 3: User Story 1 - Verificar autenticidad e ingresar código (Priority: P1) 🎯 MVP

**Goal**: Formulario público (código + T&C + CTA), normalización trim+mayúsculas, validación local `^[A-Z0-9]{14}$`, llamada `GET /api/v1/verificaciones/{codigo}`, mensajes diferenciados (vigente / expirado / inexistente / formato / rate limit / error temporal), loading anti doble clic con input editable, T&C persistentes en la visita.

**Independent Test**: Abrir portal sin credenciales; códigos vigente/expirado/inexistente con T&C → tres resultados; formato inválido → error inline sin HTTP; CTA disabled sin T&C; loading deshabilita solo CTA (quickstart S1–S2, S4–S6 parcial sin PDF).

### Tests for User Story 1 (TDD — escribir primero) ⚠️

> **NOTE: Write these tests FIRST; ensure they FAIL before implementation**

- [X] T009 [P] [US1] Unit test Red `codigo-verificacion.util.spec.ts` en `frontend/portal-verificacion/src/app/features/verificacion/codigo-verificacion.util.spec.ts`: trim extremos + mayúsculas; no strip internos; `^[A-Z0-9]{14}$` — falla hasta T012
- [X] T010 [P] [US1] Unit test Red `verificacion.service.spec.ts` en `frontend/portal-verificacion/src/app/features/verificacion/verificacion.service.spec.ts`: `validar` GET path con código normalizado; mapeo 200 vigente, 400 formato/genérico (sin documento/registro), 404 inexistente, 410 expirado, 429 rate_limit, 5xx/red error_temporal según `contracts/client-api-verificaciones.md` — falla hasta T013
- [X] T011 [US1] Unit test Red `verificacion.store.spec.ts` / `verificacion.component.spec.ts` en `frontend/portal-verificacion/src/app/features/verificacion/`: orquestación parcial US1 (solo validar); CTA disabled sin T&C o en loading; input editable en loading; formato inválido sin HTTP; conservar T&C al limpiar resultado; al editar código limpia resultado — falla hasta T014–T016

### Implementation for User Story 1

- [X] T012 [P] [US1] Implementar `normalizarCodigo` / `esFormatoValido` en `frontend/portal-verificacion/src/app/features/verificacion/codigo-verificacion.util.ts`; Green T009
- [X] T013 [US1] Implementar `VerificacionService.validar(codigo)` con `HttpClient` + `environment.apiBaseUrl` y mapper HTTP→estado/mensaje (incluye 400 → formato/genérico sin continuar a documento/registro) en `frontend/portal-verificacion/src/app/features/verificacion/verificacion.service.ts`; Green T010 (métodos documento/registro pueden stubearse o añadirse vacíos si el compilador lo exige)
- [X] T014 [US1] Implementar feature store con signals (`terminosAceptados`, `codigo`, `isLoading`, `resultado`, mensajes) en `frontend/portal-verificacion/src/app/features/verificacion/verificacion.store.ts` (orquestación: validar solo en este story); Green parte store de T011
- [X] T015 [US1] Implementar UI formulario en `verificacion.component.ts|.html|.scss` bajo `frontend/portal-verificacion/src/app/features/verificacion/`: migas, `h3.rotulo`, `alert-info` 60 días, `.lista`, input+label, checkbox T&C con enlace a `https://recursos.ccb.org.co/ccb/servicios_linea/tyc/Terminos_Y_condiciones_verificacion_Certificados_Electronicos.pdf` (target externo), CTA, errores inline/`aria-live`, mensajes resultado con estados del contrato (`vigente`/`expirado`/`inexistente`/`formato_invalido`/`rate_limit`/`error_temporal`); clases `--ccb-*` / guía §6; ReactiveForms o signals binding; Green T011
- [X] T016 [US1] Conectar ruta lazy real al `VerificacionComponent` en `verificacion.routes.ts` y verificar que el shell no muestra login; smoke: sin T&C CTA disabled; formato inválido sin Network a `/api/v1/verificaciones/**`

**Checkpoint**: MVP US1 — verificación de autenticidad usable sin visor PDF ni POST registros.

---

## Phase 4: User Story 2 - Visualizar y descargar el PDF del certificado (Priority: P1)

**Goal**: Tras validación vigente, `GET .../documento`, mostrar PDF en `.pdf-viewer-frame` con `pdfjs-dist` lazy-loaded, descarga Blob; sin visor en expirado/inexistente/vacío; mensaje orientativo si documento no disponible.

**Independent Test**: Código vigente con documento → visor + descarga; expirado/inexistente → sin visor; archivo ausente → mensaje sin marco PDF (quickstart S3 parcial, S4).

### Tests for User Story 2 (TDD — escribir primero) ⚠️

- [X] T017 [P] [US2] Extender Red `verificacion.service.spec.ts`: `obtenerDocumento` mapea 200 Base64/`tipo`, 404 `ARCHIVO_NO_ENCONTRADO` → documento_no_disponible, 503/red → error_temporal; no usa URL S3
- [X] T018 [P] [US2] Unit test Red `pdf-viewer.component.spec.ts` en `frontend/portal-verificacion/src/app/features/verificacion/pdf-viewer/pdf-viewer.component.spec.ts`: con Base64 válido prepara render/descarga; contenido vacío → no render; revoca blob URL al destroy/limpiar
- [X] T019 [US2] Extender Red store/component specs: orden validar→documento; vigente sin documento → no visor + mensaje; expirado/inexistente no llama documento

### Implementation for User Story 2

- [X] T020 [US2] Añadir `VerificacionService.obtenerDocumento(codigo)` en `verificacion.service.ts`; Green T017
- [X] T021 [US2] Implementar `PdfViewerComponent` standalone en `frontend/portal-verificacion/src/app/features/verificacion/pdf-viewer/pdf-viewer.component.ts|.html|.scss` con contenedor `.pdf-viewer-frame`, import dinámico de `pdfjs-dist` (fuera del bundle crítico), botón Descargar `.btn`; Green T018
- [X] T022 [US2] Extender `verificacion.store.ts` + `verificacion.component.*`: tras vigente obtener documento, pasar Base64 al visor, liberar Object URL al limpiar; Green T019
- [X] T023 [US2] Verificar lazy-load: build/análisis o test de import dinámico — `pdfjs-dist` no en critical path del formulario inicial (FR-022 / SC-007)

**Checkpoint**: US1 + US2 — happy path visual CA-14.1 sin auditoría aún.

---

## Phase 5: User Story 3 - Registrar la verificación exitosa para auditoría (Priority: P2)

**Goal**: Tras documento OK, `POST .../registros` automático (tercer paso); nunca en fallos; fallo de registro silencioso en UI (resultado+PDF visibles).

**Independent Test**: Éxito → Network muestra validar→documento→registros; fallos de validación/documento → sin POST; forzar fallo POST → UI sin mensaje de auditoría (quickstart S3).

### Tests for User Story 3 (TDD — escribir primero) ⚠️

- [X] T024 [P] [US3] Extender Red `verificacion.service.spec.ts`: `registrar(codigo)` POST body `{}` a `.../registros`; errores no propagan mensaje UX (Observable que completa/swallow según diseño)
- [X] T025 [US3] Extender Red store specs: POST solo tras documento OK; una sola invocación por éxito; fallos validación/documento → cero registros; fallo registro no cambia `resultado` ni limpia PDF ni setea mensaje de auditoría

### Implementation for User Story 3

- [X] T026 [US3] Implementar `VerificacionService.registrar(codigo)` en `verificacion.service.ts`; Green T024
- [X] T027 [US3] Completar orquestación en `verificacion.store.ts`: validar → documento → registro (fire-and-forget); ante fallo de POST: catch silencioso, `console.warn` o flag interno `RegistroAuditoria` únicamente — MUST NOT setear mensaje UX ni limpiar resultado/PDF; Green T025
- [X] T028 [US3] Smoke manual con DevTools Network (sin e2e): flujo feliz confirma orden GET validar → GET documento → POST registros; forzar fallo del POST (p. ej. API caída tras documento OK) y verificar que no aparece mensaje de auditoría en UI (resultado+PDF siguen visibles)

**Checkpoint**: Flujo feliz completo CA-14.1 (SC-002) alineado a FR-008a / FR-016..018.

---

## Phase 6: User Story 4 - Experiencia con imagen corporativa CCB e inclusión (Priority: P2)

**Goal**: Cumplir checklist visual §6 y WCAG 2.1 AA en el flujo principal (shell ya portado; pulir feature + a11y + tipografía).

**Independent Test**: Checklist §6 de `docs/IMAGEN_CORPORATIVA_PORTAL_VERIFICACION.md`; teclado/foco/contraste/aria en formulario+mensajes; shell sin chrome de auth (quickstart S1, S7).

### Tests / checks for User Story 4 ⚠️

- [X] T029 [P] [US4] Extender specs de `verificacion.component.spec.ts` (y shell `app.spec.ts` si aplica): labels asociados, CTA `aria-busy`/`aria-disabled` en loading, errores con `role="alert"` o `aria-live`, sin texto de login en template
- [X] T030 [US4] Gate manual SC-008/SC-009 documentado en PR: checklist visual §6 (logo, “Servicio Virtual”, barra `#033864`, TradeGothic o fallback Helvetica/Arial, tokens `.btn`/`.alert-info`/`.rotulo`) + smoke teclado (tab order del formulario, foco visible) + smoke errores/`aria-live` perceptibles; axe-core opcional no bloqueante; corregir gaps en `verificacion.component.*` / estilos feature sin romper `_tokens.scss` globales salvo extensión justificada

### Implementation for User Story 4

- [X] T031 [US4] Ajustar markup/estilos del feature en `verificacion.component.html|.scss` (y `pdf-viewer` si hace falta) para fidelidad guía: sin Material/Inter/pills/púrpura; iconos decorativos `aria-hidden="true"`; contraste/foco visibles — Green T029
- [X] T032 [US4] Revisar menú off-canvas y shell en `frontend/portal-verificacion/src/app/app.html` / `app.ts`: operable por teclado, enlaces T&C/legales (T&C apunta a la URL canónica de FR-007), sin badges de sesión; viewport estrecho usable (logo + menú; “Servicio Virtual” puede ocultarse &lt; md; formulario y visor usables según guía)

**Checkpoint**: SC-008 / SC-009 — imagen corporativa + a11y del flujo principal.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validación quickstart, rendimiento percibido y limpieza final.

- [X] T033 Ejecutar validación `specs/007-portal-verificacion/quickstart.md` (S1–S7) contra API `006` en `:8083` y anotar resultado
- [X] T034 [P] Medir carga inicial (emulación Fast 3G / Lighthouse opcional): shell+formulario usable &lt; 3 s; confirmar `pdfjs-dist` diferido (SC-007 / FR-022); ajustar lazy imports si falla
- [X] T035 [P] Barrer logs: no imprimir Base64 completo ni secrets; fallos de auditoría solo observabilidad interna
- [X] T036 Correr `npm test` en `frontend/portal-verificacion` en verde; corregir regresiones de specs US1–US4
- [X] T037 [P] Revisar que no existan imports Cognito/MAUC/Authorization en `frontend/portal-verificacion/src/`; CORS/prod documentado vía environment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — empezar de inmediato
- **Foundational (Phase 2)**: Depende de Setup — **BLOQUEA** todas las user stories
- **User Story 1 (Phase 3)**: Tras Foundational — 🎯 MVP
- **User Story 2 (Phase 4)**: Tras Foundational; integra con US1 (orden validar→documento). Independientemente testeable con mocks del service/store
- **User Story 3 (Phase 5)**: Tras US2 (necesita documento OK para disparar registro). Testeable con mocks
- **User Story 4 (Phase 6)**: Tras Foundational; prácticamente tras US1 (formulario) y ajustes post-US2 (visor). Shell ya existe
- **Polish (Phase 7)**: Tras las stories deseadas (mínimo US1+US2+US3 para CA-14.1 completo)

### User Story Dependencies

- **US1 (P1)**: Sin dependencia de otras stories — MVP
- **US2 (P1)**: Depende del resultado vigente de US1 en runtime; desarrollo puede mockear `validar`
- **US3 (P2)**: Depende de documento OK (US2) en runtime
- **US4 (P2)**: Puede avanzar en paralelo al pulir shell/a11y; checklist completo requiere UI de US1 (+ visor US2)

### Within Each User Story

- Tests Red primero → implementación Green → refactor
- Utilidades/modelos → service → store → component → integración de ruta
- Story completa y testeable antes de subir de prioridad (salvo paralelismo con mocks)

### Parallel Opportunities

- T002 / T003 en Setup
- T005 en paralelo a T006 tras Setup
- Dentro de US1: T009 ∥ T010; T012 ∥ inicio de modelos
- Dentro de US2: T017 ∥ T018
- US4 (T029–T032) puede solaparse con US3 si el formulario US1 ya existe
- Polish T034 ∥ T035 ∥ T037

---

## Parallel Example: User Story 1

```bash
# Tests Red en paralelo:
Task: "codigo-verificacion.util.spec.ts — normalización y formato"
Task: "verificacion.service.spec.ts — mapeo HTTP validar"

# Luego Green de util + service; después store/component:
Task: "codigo-verificacion.util.ts"
Task: "verificacion.service.ts validar + mapper"
Task: "verificacion.store.ts + verificacion.component.*"
```

---

## Parallel Example: User Story 2

```bash
Task: "verificacion.service.spec.ts — obtenerDocumento"
Task: "pdf-viewer.component.spec.ts — Base64 / vacío / revoke"
# Luego:
Task: "obtenerDocumento + PdfViewerComponent + store orquestación documento"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRITICAL)
3. Completar Phase 3: User Story 1
4. **STOP and VALIDATE**: Independent Test US1 / quickstart S1–S2, S4 parcial
5. Demo interna si aplica

### Incremental Delivery

1. Setup + Foundational → base HTTP lista
2. US1 → MVP verificación sin PDF
3. US2 → visor + descarga (CA-14.1 visual)
4. US3 → auditoría automática (CA-14.1 completo / SC-002)
5. US4 → checklist §6 + WCAG AA
6. Polish → quickstart S1–S7 + RNF-32

### Parallel Team Strategy

1. Equipo cierra Setup + Foundational junto
2. Dev A: US1 (formulario + validar)
3. Dev B (tras mocks/contratos service): PdfViewerComponent (US2) en paralelo al store de A
4. Dev C: a11y/checklist US4 sobre shell + formulario cuando exista
5. US3 integra orquestación final cuando US2 estabilice documento

---

## Notes

- [P] = archivos distintos, sin depender de tareas incompletas
- TDD: ninguna lógica de normalización/orquestación/mapeo HTTP sin prueba previa en rojo
- No modificar `verificacion/verificacion-*` ni `portal-certificados`
- No instalar PrimeNG/Tailwind en esta feature (research R2)
- Fallo de auditoría: silencioso en UI (FR-018)
- Commit convencional por tarea o grupo lógico (`feat:`, `test:`, `fix:`)
- Detenerse en cualquier checkpoint para validar la story de forma independiente

### Validation notes (2026-07-30 implement)

- `npm test`: **40/40** verdes.
- Build prod: initial ~261 kB; `pdfjs-dist` en chunk lazy `pdf` (~433 kB), fuera del critical path (T023/T034).
- T028/T033: API `:8083` no disponible en el entorno de implement; orden validar→documento→registro y fallo silencioso de auditoría cubiertos por `verificacion.store.spec.ts`. Smoke manual S1–S7 pendiente con API `006` arriba.
- T030: markup/clases CCB + a11y en specs; checklist visual §6 en navegador recomendado en PR.
- T037: sin Cognito/MAUC/Authorization en `src/` (solo aserciones negativas en tests/interceptor).
