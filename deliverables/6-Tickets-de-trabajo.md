# 6. Tickets de Trabajo

Backlog técnico para la fase de implementación de EventFlow, organizado por área. Cada ticket es **accionable** y trazable a documentación. Ningún ticket se ha ejecutado todavía: este documento sirve como entrada de planificación para PRs y sprints.

**Convención:**
- `ID:` identificador estable.
- `Tipo:` feature / task / chore / test / docs / security.
- `Prioridad:` Must Have (M) / Should Have (S) / Could Have (C).
- `Fuentes:` documentos fuente principales.

---

## Backend

### BE-001 — Scaffolding Node.js + Express + TypeScript

- **Tipo:** chore · **Prioridad:** M
- **Descripción:** Inicializar el monolito modular backend con TypeScript estricto, Express, ESLint, Prettier, Vitest y estructura `/src/modules/<bounded-context>/{interface,application,domain,ports,infrastructure}` + `shared-kernel`.
- **Alcance:** `package.json`, `tsconfig.json`, scripts de dev/build/test, `.env.example`, `Dockerfile`, healthcheck `/health`.
- **Aceptación:** `npm run dev` levanta el servidor; `/health` responde 200; lint y typecheck pasan.
- **Dependencias:** ninguna.
- **Fuentes:** `/docs/14`, `/docs/21`, ADR-BE-001.

### BE-002 — Cadena de middlewares (correlation, auth, RBAC, ownership, Zod, rate limit, captcha, error handler)

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Implementar middlewares Express estándar en el orden definido en `/docs/14` y `/docs/19`.
- **Alcance:** correlation ID, logging estructurado, sesión cookie HTTP-only, `roleMiddleware`, `ownershipMiddleware`, validación Zod, rate limit por IP/usuario, captcha en flujos sensibles, error handler con envelope estándar.
- **Aceptación:** tests negativos de autorización pasan; envelope de error consistente; `X-Correlation-Id` propagado.
- **Dependencias:** BE-001.
- **Fuentes:** `/docs/14`, `/docs/16`, `/docs/19`, ADR-SEC-002 a ADR-SEC-006, ADR-API-002, ADR-API-004.

### BE-003 — Módulo `iam` (auth, sesión, perfil)

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Implementar registro, login, logout, password reset y perfil. Hashing con `argon2id`/`bcrypt`. Captcha y rate limit aplicados.
- **Aceptación:** flujo end-to-end de registro/login con cookie firmada; tokens de reset de un solo uso; tests cubren casos negativos.
- **Dependencias:** BE-002.
- **Fuentes:** `/docs/19`, `/docs/16`, FRD (`FR-AUTH-*`).

### BE-004 — Módulo `event-planning`

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Use cases de creación, lectura, edición y cierre de eventos; gestión de tareas; presupuesto y líneas de presupuesto.
- **Aceptación:** moneda inmutable post-creación; estados `draft`/`active`/`completed`/`cancelled`; auto-cierre 2 días después de `event_date` via job.
- **Dependencias:** BE-002, DB-001.
- **Fuentes:** Business Rules, FRD, `/docs/14`, `/docs/16`.

### BE-005 — Módulo `vendor-management`

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Perfil de proveedor, servicios, portafolio y directorio público para organizadores.
- **Aceptación:** solo `approved` aparece en directorio; portafolio limitado a 10 imágenes; cambios de categoría con `requires_admin_review`.
- **Dependencias:** BE-002, DB-001.
- **Fuentes:** Business Rules, FRD, `/docs/14`, `/docs/16`.

### BE-006 — Módulo `quote-flow`

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** `QuoteRequest`, `Quote`, `BookingIntent` con validaciones de negocio y notificaciones asociadas.
- **Aceptación:** límites de 5 activas por categoría/evento; uno activo por `(evento, proveedor)` (`409`); `valid_until` default 15 días; transiciones de estado válidas.
- **Dependencias:** BE-002, BE-004, BE-005.
- **Fuentes:** Business Rules, FRD, `/docs/14`, `/docs/16`.

### BE-007 — Módulo `reviews`

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Crear, listar y moderar reseñas con soft delete y trazabilidad.
- **Aceptación:** una reseña por `(evento, proveedor)`; rating 1–5; solo permitida con `BookingIntent.confirmed`.
- **Dependencias:** BE-006.
- **Fuentes:** Business Rules, `/docs/19`.

### BE-008 — Módulo `admin-governance`

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Aprobación de proveedores, gestión de categorías, moderación de reseñas y `AdminAction` append-only.
- **Aceptación:** toda operación registrada en `admin_actions` con motivo; soft delete preferente.
- **Dependencias:** BE-005, BE-007.
- **Fuentes:** `/docs/19`, `/docs/14`.

### BE-009 — Módulo `notifications` (in-app + email simulado)

- **Tipo:** feature · **Prioridad:** S
- **Descripción:** Bandeja in-app y email simulado por logs estructurados.
- **Aceptación:** eventos clave (`quote_received`, `quote_responded`, `booking_confirmed`, `review_published`, `admin_approval`) generan notificación.
- **Dependencias:** BE-002.
- **Fuentes:** `/docs/14`.

### BE-010 — Módulo `attachments`

- **Tipo:** feature · **Prioridad:** S
- **Descripción:** Upload `multipart/form-data` con allowlist MIME, almacenamiento polimórfico y soft delete.
- **Aceptación:** `LocalFileStorageAdapter` en dev; `ObjectStorageAdapter` (S3) preparado para cloud.
- **Dependencias:** BE-002.
- **Fuentes:** `/docs/14`, `/docs/19`, ADR-DEVOPS-005.

### BE-011 — Scheduled jobs (auto-complete, expire quotes, seed reset)

- **Tipo:** task · **Prioridad:** S
- **Descripción:** Jobs ligeros (`node-cron` o `setInterval` controlado) para auto-cierre de eventos, expiración de cotizaciones y reset operativo.
- **Aceptación:** jobs idempotentes; logs estructurados; tests de tiempo simulado.
- **Dependencias:** BE-004, BE-006.
- **Fuentes:** `/docs/14`, ADR-BE-004.

---

## Database

### DB-001 — Prisma schema inicial (`prisma/schema.prisma`)

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Modelar entidades MVP con UUID v4, `snake_case`, enums nativos, JSONB acotado y mapping `@map`/`@@map`.
- **Aceptación:** `prisma generate` sin warnings; tipos consistentes con DTOs Zod.
- **Dependencias:** BE-001.
- **Fuentes:** `/docs/6`, `/docs/18`.

### DB-002 — Migraciones Prisma

- **Tipo:** task · **Prioridad:** M
- **Descripción:** Migraciones iniciales con constraints PK/FK, unique parciales y check constraints. SQL crudo solo donde Prisma no soporta directamente.
- **Aceptación:** `prisma migrate dev` ejecuta limpio; rollback documentado.
- **Dependencias:** DB-001.
- **Fuentes:** `/docs/18`, ADR-DB-005.

### DB-003 — Índices query-driven

- **Tipo:** task · **Prioridad:** M
- **Descripción:** Índices derivados de filtros y ordenamientos definidos en `/docs/16`. Incluye índices parciales para `status` y soft delete.
- **Aceptación:** EXPLAIN ANALYZE sobre queries críticas sin secuencial scans.
- **Dependencias:** DB-002.
- **Fuentes:** `/docs/18`, `/docs/16`.

### DB-004 — Seed determinista (`seed:demo`)

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Script `prisma/seed.ts` con escenarios obligatorios de `/docs/11`. Todas las filas con `is_seed=true`.
- **Aceptación:** idempotente; dos ejecuciones consecutivas dejan el sistema igual; cubre eventos en `draft`/`active`/`completed`, cotizaciones, booking, reseñas, vendors aprobados.
- **Dependencias:** DB-002.
- **Fuentes:** `/docs/11`, `/docs/14`.

### DB-005 — Reset surgical `is_seed`

- **Tipo:** task · **Prioridad:** S
- **Descripción:** Endpoint protegido + script `seed:reset` que ejecuta `DELETE WHERE is_seed = true` respetando FKs.
- **Aceptación:** no afecta datos con `is_seed=false`; logs auditados en `AdminAction`.
- **Dependencias:** DB-004, BE-008.
- **Fuentes:** `/docs/11`, `/docs/21`.

---

## AI / PromptOps

### AI-001 — Puerto `LLMProvider`

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Definir el contrato del puerto en Application/Ports con tipos de entrada/salida tipados.
- **Aceptación:** dominio sin dependencias a SDKs concretos.
- **Dependencias:** BE-001.
- **Fuentes:** `/docs/17`, ADR-AI-001.

### AI-002 — `OpenAIProvider`

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Adapter para OpenAI con timeout 60s, validación JSON estricta, reintentos acotados y logging redactado.
- **Aceptación:** tests de contrato pasan; secretos solo en backend.
- **Dependencias:** AI-001.
- **Fuentes:** `/docs/17`, `/docs/19`, ADR-AI-002.

### AI-003 — `MockAIProvider`

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Adapter determinista para tests, demo y fallback. Salidas alineadas con schemas Zod.
- **Aceptación:** CI corre 100% con `LLM_PROVIDER=mock`.
- **Dependencias:** AI-001.
- **Fuentes:** `/docs/17`, ADR-AI-003, ADR-TEST-003.

### AI-004 — `AnthropicProvider` stub

- **Tipo:** chore · **Prioridad:** C
- **Descripción:** Stub no funcional para validar sustituibilidad del puerto. Lanza error controlado si se invoca.
- **Aceptación:** no usado en MVP; documentado.
- **Dependencias:** AI-001.
- **Fuentes:** `/docs/17`, ADR-AI-004.

### AI-005 — Persistencia `AIRecommendation` con lifecycle HITL

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Use case que persiste cada invocación IA con `accepted=false` y permite transicionar `pending` → `accepted` / `edited` / `rejected` / `discarded`.
- **Aceptación:** dominio nunca muta sin acción humana explícita; tests cubren todas las transiciones.
- **Dependencias:** AI-001, DB-002.
- **Fuentes:** `/docs/17`, ADR-AI-005.

### AI-006 — Prompt registry versionado (+ tabla opcional `ai_prompt_versions`)

- **Tipo:** feature · **Prioridad:** S
- **Descripción:** Catálogo de prompts en código, con versionado semántico y promoción opcional a tabla para trazabilidad histórica.
- **Aceptación:** `prompt_version_id` registrado en cada `AIRecommendation`.
- **Dependencias:** AI-001.
- **Fuentes:** `/docs/17`, ADR-AI-006.

### AI-007 — Validación JSON estricta y fallback controlado

- **Tipo:** task · **Prioridad:** M
- **Descripción:** Validar la salida del LLM con Zod; reintentar acotado; usar `MockAIProvider` como fallback si `AI_USE_MOCK_FALLBACK=true`.
- **Aceptación:** salidas malformadas no llegan al dominio; `fallback_used` registrado.
- **Dependencias:** AI-002, AI-003.
- **Fuentes:** `/docs/17`, ADR-AI-007.

### AI-008 — Mitigación de prompt injection y minimización de datos

- **Tipo:** security · **Prioridad:** M
- **Descripción:** Sanitización de inputs, instrucciones de sistema robustas, redacción en logs, sólo enviar campos necesarios al LLM.
- **Aceptación:** revisión de seguridad pasa; tests cubren payloads adversarios mínimos.
- **Dependencias:** AI-002.
- **Fuentes:** `/docs/17`, `/docs/19`, ADR-SEC-001.

---

## Frontend

### FE-001 — Scaffolding Next.js + App Router + TypeScript

- **Tipo:** chore · **Prioridad:** M
- **Descripción:** Crear app con App Router, Tailwind, design tokens, TanStack Query, React Hook Form, Zod, next-intl.
- **Aceptación:** `npm run dev` levanta la app; build pasa; layout base con i18n.
- **Dependencias:** ninguna.
- **Fuentes:** `/docs/15`, ADR-FE-001, ADR-FE-002.

### FE-002 — Layouts por rol y guardas UX

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Áreas `(organizer)`, `(vendor)`, `(admin)` con guardas UX por sesión y rol. Áreas públicas SEO-ready para perfiles de vendor.
- **Aceptación:** acceso a rutas restringidas redirige correctamente; backend sigue siendo fuente de verdad.
- **Dependencias:** FE-001.
- **Fuentes:** `/docs/15`, ADR-FE-003, ADR-FE-004.

### FE-003 — Workspace del organizador

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Wizard de creación de evento, dashboard, vistas de checklist y presupuesto, comparador de cotizaciones.
- **Aceptación:** flujo navegable; estados vacíos, loading y error; responsive desktop/móvil.
- **Dependencias:** FE-002, BE-004, BE-006.
- **Fuentes:** `/docs/15`, FRD.

### FE-004 — UX human-in-the-loop para IA

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Badges visuales para contenido IA, modal de revisión, transiciones `accepted`/`edited`/`rejected`/`discarded`.
- **Aceptación:** ninguna sugerencia IA muta el dominio sin acción explícita del usuario.
- **Dependencias:** FE-003, AI-005.
- **Fuentes:** `/docs/15`, `/docs/17`, ADR-AI-005.

### FE-005 — Directorio y perfil de proveedor

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Listado filtrable y página de perfil para organizadores. Páginas públicas SEO-ready para futuro.
- **Aceptación:** filtros por categoría/ciudad/precio; paginación estable.
- **Dependencias:** FE-002, BE-005.
- **Fuentes:** `/docs/15`, ADR-FE-004.

### FE-006 — Workspace del proveedor

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Edición de perfil, portafolio (máx 10 imágenes por work), gestión de `QuoteRequest` y envío de `Quote`.
- **Aceptación:** restricciones de upload visibles; bloqueo de edición tras envío de `Quote`.
- **Dependencias:** FE-002, BE-005, BE-006.
- **Fuentes:** `/docs/15`, Business Rules.

### FE-007 — Panel admin

- **Tipo:** feature · **Prioridad:** M
- **Descripción:** Aprobación de proveedores, moderación de reseñas y catálogo de categorías. UI con motivos obligatorios.
- **Aceptación:** acciones registradas y reflejadas en backend; UX clara sobre soft delete.
- **Dependencias:** FE-002, BE-008.
- **Fuentes:** `/docs/15`, `/docs/19`.

### FE-008 — i18n, currency display y accesibilidad mínima

- **Tipo:** task · **Prioridad:** M
- **Descripción:** Configurar next-intl con `es-LATAM`, `es-ES`, `pt`, `en`. Mostrar moneda sin conversión. Cumplir teclado, foco, labels, contraste y ARIA básicos.
- **Aceptación:** lint y axe básicos pasan; cambio de idioma visible.
- **Dependencias:** FE-001.
- **Fuentes:** `/docs/15`, NFR.

---

## Testing

### TEST-001 — Backend unit + integration con Vitest + Supertest

- **Tipo:** test · **Prioridad:** M
- **Descripción:** Tests por capa (Domain, Application, Infrastructure), por use case + repo Prisma y por controlador con Supertest.
- **Aceptación:** cobertura mínima acordada; CI bloquea regresiones.
- **Dependencias:** BE-002+.
- **Fuentes:** `/docs/20`, ADR-TEST-001.

### TEST-002 — API + contract tests con MSW

- **Tipo:** test · **Prioridad:** M
- **Descripción:** Pruebas de API end-to-end con Supertest y handlers MSW alineados con DTOs.
- **Aceptación:** drift entre backend y frontend se detecta en CI.
- **Dependencias:** TEST-001.
- **Fuentes:** `/docs/20`.

### TEST-003 — Tests negativos de autorización (quality gate)

- **Tipo:** security · **Prioridad:** M
- **Descripción:** Casos negativos RBAC + ownership + assignment con 401/403/404 esperados.
- **Aceptación:** suite obligatoria en CI antes de merge.
- **Dependencias:** TEST-001.
- **Fuentes:** `/docs/20`, ADR-TEST-004.

### TEST-004 — Tests IA deterministas con `MockAIProvider`

- **Tipo:** test · **Prioridad:** M
- **Descripción:** Suite que ejecuta los flujos IA con `LLM_PROVIDER=mock` y verifica lifecycle HITL.
- **Aceptación:** sin llamadas a OpenAI en CI.
- **Dependencias:** AI-003, AI-005.
- **Fuentes:** `/docs/20`, ADR-TEST-003.

### TEST-005 — Frontend (Vitest + Testing Library + MSW)

- **Tipo:** test · **Prioridad:** M
- **Descripción:** Tests de componentes, hooks y flujos con MSW.
- **Aceptación:** cobertura por feature; estados vacíos/loading/error verificados.
- **Dependencias:** FE-001+.
- **Fuentes:** `/docs/20`.

### TEST-006 — E2E con Playwright sobre seed

- **Tipo:** test · **Prioridad:** S
- **Descripción:** Recorridos críticos (registro/login, creación de evento, plan IA, quote flow, booking, review).
- **Aceptación:** corre con seed reproducible y `MockAIProvider`.
- **Dependencias:** TEST-005, DB-004.
- **Fuentes:** `/docs/20`.

### TEST-007 — Accesibilidad mínima

- **Tipo:** test · **Prioridad:** S
- **Descripción:** Checks automatizados (axe) + revisión manual de teclado/foco.
- **Aceptación:** páginas críticas sin violaciones críticas.
- **Dependencias:** FE-008.
- **Fuentes:** `/docs/20`, NFR.

---

## Security

### SEC-001 — Cookies HTTP-only firmadas y rotación de sesión

- **Tipo:** security · **Prioridad:** M
- **Descripción:** Sesión vía cookie HTTP-only firmada; rotación tras login/cambio de contraseña.
- **Aceptación:** ningún token en `localStorage`; pruebas verifican headers.
- **Dependencias:** BE-003.
- **Fuentes:** `/docs/19`, ADR-SEC-002.

### SEC-002 — Captcha y rate limiting en flujos sensibles

- **Tipo:** security · **Prioridad:** M
- **Descripción:** Aplicar captcha + rate limit en registro, login, password reset y creación de `QuoteRequest`.
- **Aceptación:** tests verifican bloqueos esperados (429); UI muestra mensajes claros.
- **Dependencias:** BE-002.
- **Fuentes:** `/docs/19`, ADR-SEC-004.

### SEC-003 — CSRF, CORS y security headers

- **Tipo:** security · **Prioridad:** M
- **Descripción:** Política CORS por entorno, CSRF para cookies, security headers (CSP básica, HSTS, X-Content-Type, etc.).
- **Aceptación:** tests automatizados de headers.
- **Dependencias:** BE-002.
- **Fuentes:** `/docs/19`, ADR-SEC-006.

### SEC-004 — Gestión de secretos en backend + Secrets Manager / SSM

- **Tipo:** security · **Prioridad:** M
- **Descripción:** Secretos cargados desde Secrets Manager / SSM en producción; `.env.example` documentado.
- **Aceptación:** sin secretos en el repo ni en logs; pruebas verifican que el frontend no lee secretos.
- **Dependencias:** DEVOPS-002.
- **Fuentes:** `/docs/19`, `/docs/21`, ADR-SEC-005.

---

## DevOps

### DEVOPS-001 — Dockerizar backend para AWS App Runner

- **Tipo:** chore · **Prioridad:** M
- **Descripción:** `Dockerfile` multi-stage para Node.js LTS; build size optimizado.
- **Aceptación:** imagen corre localmente; healthcheck OK.
- **Dependencias:** BE-001.
- **Fuentes:** `/docs/21`, ADR-DEVOPS-003.

### DEVOPS-002 — GitHub Actions CI/CD

- **Tipo:** chore · **Prioridad:** M
- **Descripción:** Workflows con quality gates (lint, typecheck, build, tests, validación de migraciones).
- **Aceptación:** CI verde en `main`; despliegue automatizado a Amplify y App Runner cuando aplique.
- **Dependencias:** DEVOPS-001.
- **Fuentes:** `/docs/21`, ADR-DEVOPS-006.

### DEVOPS-003 — Despliegue frontend a AWS Amplify Hosting

- **Tipo:** task · **Prioridad:** S (estado: planeado)
- **Descripción:** Configurar Amplify Hosting para Next.js; dominio temporal aceptable.
- **Aceptación:** preview funcional; cookies HTTP-only sobre HTTPS.
- **Dependencias:** FE-001, DEVOPS-002.
- **Fuentes:** `/docs/21`, ADR-DEVOPS-002. **Planeado — sin URL pública aún.**

### DEVOPS-004 — Despliegue backend a AWS App Runner

- **Tipo:** task · **Prioridad:** S (estado: planeado)
- **Descripción:** Configurar App Runner con la imagen Docker, variables de entorno y secretos.
- **Aceptación:** `/health` responde 200 en URL pública; logs en CloudWatch.
- **Dependencias:** DEVOPS-001, DEVOPS-002.
- **Fuentes:** `/docs/21`, ADR-DEVOPS-003. **Planeado — sin URL pública aún.**

### DEVOPS-005 — Amazon RDS PostgreSQL

- **Tipo:** task · **Prioridad:** S (estado: planeado)
- **Descripción:** Crear instancia RDS PostgreSQL, parámetros mínimos, backups básicos.
- **Aceptación:** Prisma se conecta desde App Runner.
- **Dependencias:** DB-002.
- **Fuentes:** `/docs/21`, ADR-DEVOPS-004. **Planeado.**

### DEVOPS-006 — S3 para attachments

- **Tipo:** task · **Prioridad:** S (estado: planeado)
- **Descripción:** Bucket S3 privado para portafolios; URLs presignadas según necesidad.
- **Aceptación:** uploads y descargas controladas; sin público abierto.
- **Dependencias:** BE-010.
- **Fuentes:** `/docs/21`, ADR-DEVOPS-005. **Planeado.**

### DEVOPS-007 — Secrets Manager / SSM y CloudWatch

- **Tipo:** task · **Prioridad:** S (estado: planeado)
- **Descripción:** Inyectar secretos en App Runner; logs estructurados en CloudWatch con `correlationId`.
- **Aceptación:** sin secretos en variables planas; búsqueda por correlación funciona.
- **Dependencias:** DEVOPS-004.
- **Fuentes:** `/docs/21`, ADR-DEVOPS-007.

### DEVOPS-008 — Demo seed reset operativo

- **Tipo:** task · **Prioridad:** S (estado: planeado)
- **Descripción:** Job/operación para limpiar y volver a sembrar el entorno Demo en cada evaluación.
- **Aceptación:** reset reproducible en menos de N minutos.
- **Dependencias:** DB-004, DB-005.
- **Fuentes:** `/docs/21`, `/docs/11`.

---

## Documentación / Demo

### DOC-001 — README de instalación e instrucciones de demo

- **Tipo:** docs · **Prioridad:** S
- **Descripción:** Documentar setup local, variables de entorno, `seed:demo`, credenciales demo y modo `LLM_PROVIDER=mock`.
- **Aceptación:** un evaluador puede ejecutar el proyecto siguiendo el README sin pasos faltantes.
- **Dependencias:** BE-001, FE-001, DB-004.
- **Fuentes:** `/docs/11`, `/docs/21`.

### DOC-002 — OpenAPI 3.1 generado desde DTOs Zod

- **Tipo:** docs · **Prioridad:** S
- **Descripción:** Generar `openapi.yaml` desde DTOs Zod para evaluadores.
- **Aceptación:** archivo válido contra OpenAPI 3.1; coincide con endpoints implementados.
- **Dependencias:** BE-002.
- **Fuentes:** `/docs/16`, ADR-API-003.

### DOC-003 — Capturas y video demo

- **Tipo:** docs · **Prioridad:** S
- **Descripción:** Capturas y video corto de los flujos críticos (creación de evento + IA + quote + booking + review).
- **Aceptación:** evidencia disponible en `/deliverables` o en URL pública.
- **Dependencias:** FE-003, FE-005, FE-006, FE-007.
- **Fuentes:** `/docs/21`. **Estado: pendiente.**

---

## Documentos fuente

- [Architecture Vision & Principles](../docs/12-Architecture-Vision-and-Principles.md)
- [System Architecture Document](../docs/13-System-Architecture-Document.md)
- [Backend Technical Design](../docs/14-Backend-Technical-Design.md)
- [Frontend Architecture Design](../docs/15-Frontend-Architecture-Design.md)
- [API Design Specification](../docs/16-API-Design-Specification.md)
- [AI Architecture & PromptOps Design](../docs/17-AI-Architecture-and-PromptOps-Design.md)
- [Database Physical Design](../docs/18-Database-Physical-Design.md)
- [Security & Authorization Design](../docs/19-Security-and-Authorization-Design.md)
- [Testing Strategy](../docs/20-Testing-Strategy.md)
- [Deployment & DevOps Design](../docs/21-Deployment-and-DevOps-Design.md)
- [Architecture Decision Records](../docs/22-Architecture-Decision-Records.md)
