# Implementation Plan: Portal de Verificación de Certificados

**Branch**: `007-portal-verificacion` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-portal-verificacion/spec.md`

## Summary

Completar el SPA público Angular 22 `frontend/portal-verificacion` (TKT-067 / HU-14 / RF-28) sobre el scaffold y tema corporativo CCB ya portados: formulario de código (normalización trim+mayúsculas, T&C, estados de carga), orquestación secuencial del API público de feature `006` (validar → documento Base64 → registro de auditoría), visor PDF con `pdf.js` en contenedor `.pdf-viewer-frame` (lazy-loaded para RNF-32), y mensajes orientativos sin autenticación Cognito/MAUC. Sin cambios al microservicio `verificacion`.

## Technical Context

**Language/Version**: TypeScript ~5.x / Angular 22 (standalone components, signals); Node/npm según `packageManager` del scaffold (`npm@11`).

**Primary Dependencies**: `@angular/common` (HttpClient), `@angular/forms` (ReactiveForms), `@angular/router`, RxJS 7.8, **`pdfjs-dist`** (visor PDF; carga diferida). Tema corporativo SCSS propio (`src/styles/ccb/`, tokens `--ccb-*`). Vitest + Testing Library/Angular test harness del scaffold para TDD. Sin JWT interceptor. PrimeNG/Tailwind **no** se añaden en esta feature (ver research R2 / Complexity Tracking).

**Storage**: N/A en el portal (sin persistencia local de sesión ni tokens). El PDF vive en memoria del cliente (Base64 → Uint8Array / blob URL) solo durante la visita. Auditoría e IP las captura el servicio `verificacion` (8083).

**Testing**: TDD obligatorio (Red → Green → Refactor) en servicios/helpers/componentes del flujo: `ng test` (Vitest). Cobertura de lógica de normalización/orquestación y mapeo HTTP→mensajes; specs de `VerificacionService`, `VerificacionComponent`/`store`, `PdfViewerComponent` según TKT-067. Checklist visual §6 y smoke a11y (teclado/contraste) en quickstart; axe-core opcional en CI si se cablea sin bloquear el MVP.

**Target Platform**: SPA estática servida en dominio público (`verificacion.ccb.org.co`); desarrollo local `ng serve` (p. ej. `http://localhost:4200`) contra API `verificacion` en `:8083` con CORS no-prod.

**Project Type**: Frontend SPA (Angular) en monorepo; consume API REST pública ya especificada/implementada en `006-servicio-publico-verificacion`. No modifica backend Java.

**Performance Goals**: Carga inicial (shell + formulario usable) **&lt; 3 s en 3G** (RNF-32 / SC-007 / FR-022). Flujo feliz usable en &lt; 2 min (SC-001). Visor/`pdf.js` fuera del bundle crítico inicial.

**Constraints**: Público sin login/sesión; solo API `/api/v1/verificaciones/**`; código normalizado a exactamente 14 `A–Z0–9` antes de llamar; orden fijo validar→documento→registro; fallo de auditoría silencioso en UI; imagen corporativa inmutable (guía + ADR-0001); WCAG 2.1 AA (RNF-33); sin Material/Inter/pills/púrpura; sin URLs S3; CORS `*.ccb.org.co` (prod).

**Scale/Scope**: Una feature de verificación (ruta principal `/`), shell ya existente, servicio HTTP + orquestador, visor PDF, interceptor de `X-Correlation-Id` (obligatorio en esta feature), environments de API base URL. Fuera de alcance: `portal-certificados`, Cognito/MAUC, cambios a `verificacion-*`, ETL legado.

## Constitution Check

*GATE: Debe pasar antes de Phase 0. Re-evaluado tras Phase 1.*

| Principio | Aplicabilidad | Cumplimiento del plan |
|---|---|---|
| I. Stack Tecnológico Fijo | Alta | Angular 22 obligatorio. Nueva dep `pdfjs-dist` ya presupuesta en TKT-067 / AGENTS / reglas Angular y alineada a ADR-0002 (Base64→pdf.js). Sin sustituir el stack. ✅ |
| II. Clean Architecture + CQRS | Baja (FE) | Separación feature: `core`/`shared` vs `features/verificacion` (service + componentes + utilidades puras testeables). No aplica capas Java. ✅ |
| III. Base de Datos | N/A | Portal no toca SQL Server/Liquibase/JPA. ✅ |
| IV. Integraciones SOAP | N/A | Fuera de alcance. ✅ |
| V. Resiliencia e Idempotencia | Media | CTA deshabilitado en vuelo (anti doble clic); auditoría fallida no bloquea UX; sin reintentos agresivos no idempotentes en POST registros (cada éxito = nueva fila en API). ✅ |
| VI. Auth y CORS | **Central** | Sin JWT/Cognito/MAUC en el portal. Solo consume endpoints públicos. Base URL por environment; CORS lo aplica el API (006/shared-auth). ✅ |
| VII. Seguridad y Protección de Datos | Alta | Sin secrets en repo; no loguear tokens; mensajes sin enumeración; PDF solo en memoria del cliente; no URLs S3. ✅ |
| VIII. TDD — NO NEGOCIABLE | Alta | Tests primero para normalización, service HTTP mapping, orquestación y visor (TKT-067). ✅ |
| IX. Calidad | Alta | Convenciones Angular del repo; commits convencionales; nomenclatura ES en dominio de UI (`CodigoVerificacion`, etc.). ✅ |
| X. Observabilidad | Baja–Media | Header `X-Correlation-Id` en cada request vía interceptor ligero (obligatorio en esta feature); fallos de auditoría solo a `console.warn`/flag interno, nunca a UI. Dynatrace APM de microservicios no es responsabilidad de este SPA. ✅ |
| XI. Rendimiento y Capacidad | Alta | RNF-32: lazy-load de `pdf.js`/visor; rate limit 429 del API mapeado a mensaje orientativo. ✅ |

**Resultado del gate (pre-Phase 0)**: PASS. Desviación acotada vs ADR-0001 (PrimeNG no instalado en este portal) documentada en Complexity Tracking y research R2.

**Re-evaluación post-Phase 1**: PASS. Contratos de cliente, data-model de vista y quickstart no introducen Cognito, JPA, SOAP, ni cambios al microservicio. `pdfjs-dist` permanece justificado; PrimeNG diferido sin violar fidelidad corporativa (CSS CCB ya portado).

## Project Structure

### Documentation (this feature)

```text
specs/007-portal-verificacion/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── client-api-verificaciones.md
│   └── ui-verificacion.md
└── tasks.md             # /speckit-tasks — NOT created here
```

### Source Code (repository root)

```text
frontend/portal-verificacion/
├── public/assets/brand/          # Ya portado: logo, fonts, icons
├── src/
│   ├── styles/ccb/               # Ya portado: tokens, layout, components
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   ├── app/
│   │   ├── app.ts / app.html     # Shell corporativo (existente)
│   │   ├── app.config.ts         # + provideHttpClient, interceptors
│   │   ├── app.routes.ts         # lazy route → verificación
│   │   ├── core/
│   │   │   └── http/
│   │   │       └── correlation-id.interceptor.ts
│   │   └── features/
│   │       └── verificacion/
│   │           ├── verificacion.routes.ts
│   │           ├── verificacion.component.ts|.html|.scss|.spec.ts
│   │           ├── verificacion.service.ts|.spec.ts
│   │           ├── verificacion.store.ts|.spec.ts   # signals / orquestación
│   │           ├── codigo-verificacion.util.ts|.spec.ts  # normalize + format
│   │           ├── verificacion-api.models.ts
│   │           └── pdf-viewer/
│   │               └── pdf-viewer.component.ts|.html|.scss|.spec.ts
│   ├── styles.scss
│   ├── index.html
│   └── main.ts
├── package.json                  # + pdfjs-dist
└── angular.json
```

**Structure Decision**: Extender el scaffold existente `frontend/portal-verificacion` (shell + tema ya hechos). Feature lazy-loaded bajo `features/verificacion` según `.cursor/rules/angular-frontend.mdc`. HttpClient solo en `VerificacionService`. Estado con signals (store de feature). Sin tocar módulos Java `verificacion-*` ni `portal-certificados`. Contratos de API reutilizan/referencian `specs/006-servicio-publico-verificacion/contracts/` sin duplicar el OpenAPI backend.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No instalar PrimeNG 22 + Tailwind 4 en `portal-verificacion` pese a ADR-0001 | El scaffold ya reproduce la identidad con SCSS CCB; el flujo es un formulario nativo + pdf.js. Evitar peso de UI kit protege RNF-32 (&lt;3s 3G). Fidelidad visual se cumple con tokens/clases existentes (guía §6). | Añadir PrimeNG unstyled ahora solo para input/checkbox/button aumentaría bundle y setup sin ganar comportamiento que ReactiveForms + HTML no cubran; portal-certificados adoptará PrimeNG cuando lo necesite |
| Dependencia `pdfjs-dist` (fuera del package.json actual) | TKT-067 / AGENTS / regla Angular / ADR-0002 exigen visor integrado sobre Base64; no hay alternativa en el stack Angular base | `<iframe src=blob>` sin pdf.js: peor control de UI/marco corporativo y descarga; abrir pestaña externa rompe CA-14.1 |
