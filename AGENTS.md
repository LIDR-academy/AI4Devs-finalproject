# AGENTS.md — Project instructions & memory

This file is the persistent memory and working agreement for AI assistants on this
project. Read it at the start of every session.

## Working conventions

- **Personal project.** Owner: Xavier Vergés (<xaviverges@gmail.com>).
- **Memory lives here.** Record durable project facts, decisions, and context in this
  file (AGENTS.md) — not in the default `.claude` memory directory.
- **Prompt log.** Log **only project-content prompts** (those producing deliverables:
  architecture, data model, API, code, etc.). **Skip meta/setup/workflow prompts.** For
  each logged prompt, do **both**:
  1. Append it to the chronological **"Log de prompts"** section at the end of
     `prompts.md`, with a short summary ("resumen") of the assistant's response.
  2. File the most relevant ones into their matching structured deliverable section,
     respecting the "max 3 per section" rule.
- **Don't invent.** When anything is ambiguous or unknown, ask the user rather than
  guessing.
- All diagrams must be written in Mermaid language for enhanced compatibility

## Project facts

- **Context:** AI4Devs final project (Lidr). The `main` branch currently contains only
  documentation scaffolding: `readme.md` (project deliverable template, in Spanish) and
  `prompts.md` (prompt log template). Application code is expected on other branches.
- **Product:** Clickoteca — LEGO set rental-by-subscription library. MVP defined as
  an OpenSpec change at `openspec/changes/clickoteca-mvp/` (not yet implemented —
  `tasks.md` all unchecked). Pricing (BASIC 14,99€/mes, PREMIUM 24,99€/mes) is
  benchmarked against real competitors (Brick Borrow, Pley, BrickDrop, NetBricks) —
  see `design.md` D9. Seed catalog data/images recommended source: Rebrickable
  (free public dataset/API, has `img_url` per set; no age/difficulty fields —
  curate those manually for the seed subset).
- **Arquitectura/stack (tarea 1.1, en curso):** Confirmado — **framework
  Next.js full-stack** (App Router, TypeScript; decidido 2026-07-05) que sirve
  **front (SSR/RSC)** y **API REST pública** (Route Handlers en `app/api/*` +
  Zod → OpenAPI) en un solo proyecto; capa de datos **PostgreSQL + Prisma**;
  arquitectura en capas (Route Handlers → casos de uso → repositorios → dominio),
  dominio agnóstico del framework, sin DI pesado; scheduler como **proceso Node
  aparte** (node-cron), no in-process (Next multi-instancia lo duplicaría);
  frontend cross-browser (evergreen), responsive mobile-first, accesibilidad
  objetivo **WCAG 2.1 AA** (EN 301 549 / European Accessibility Act). Hosting
  **decidido**: **VM única con IP pública** en **Oracle Cloud Free Tier** (Ampere
  A1 / ARM64, 2 OCPU · 12 GB · 50 GB, Ubuntu 24.04). Un reverse proxy (Caddy)
  termina TLS y enruta al servidor Next (front + `/api`); Postgres
  corre en `localhost`; las imágenes en el filesystem → **mismo origen** (sin CORS,
  cookie de sesión *first-party*). Descartado el split PaaS Vercel+Render+Neon
  (multi-origen, cold-start, suspensión de BD); plan B si Oracle reclama la
  instancia: Hetzner CX22 (~4 €/mes). Detalle en `documents/ADR-0001` §5 y
  `ADR-0002` (auth + errores).
- **PRD:** borrador completo en `documents/PRD.md`, sintetizado desde
  `openspec/changes/clickoteca-mvp/` + `readme.md` §1.2 + log de prompts.
  Sirve de fuente detallada de la que luego se condensará `readme.md` §1.
  Pendiente de revisión del usuario; diseño/UX y criterios de éxito de
  negocio quedaron marcados como pendientes ahí (no inventados).
- **Modelo de datos (definido 2026-07-04):** documentado en `documents/PRD.md` §15
  (tres anillos de importancia + diagramas ER Mermaid + máquina de estados de
  `Copy`) e implementado en `prisma/schema.prisma` (22 modelos + 18 enums,
  PostgreSQL). Reflejado también en `readme.md` §3. Modelos en inglés (convención
  Prisma) que mapean a los términos de dominio en español de las specs. Decisiones
  clave añadidas a `design.md`: **D10** (catálogo de entidades + `User` único con
  rol, sin `Employee`) y **D11** — que en su primera versión (esta sesión) fue
  "`score` de cola materializado + recálculo", pero **fue reescrito** ese mismo día a
  **orden por `effectiveEntryAt` inmutable, sin recálculo** (ver sesión de
  arquitectura más abajo y `design.md` D11). El modelo de datos refleja ya la forma
  reescrita: la entrada de cola guarda `enqueuedAt` + `appliedBonus` +
  `effectiveEntryAt` (no una columna `score`). Specs y `readme.md`/`PRD.md`
  sincronizados (Requirement "Orden de cola por entrada efectiva inmutable" en
  `reservation-queue`; `tasks.md` 1.2/6.2);
  `openspec validate clickoteca-mvp --strict` en verde. **Nota de versión:**
  el esquema aún trae la forma clásica `url = env("DATABASE_URL")`; con la decisión
  de **Prisma 7** (ver hecho más abajo) hay que **migrar el datasource a
  `prisma.config.ts`** al inicializar el backend.
- **Arquitectura C4 + ADR (2026-07-04):** `documents/C4-architecture.md`
  (diagramas C4 niveles 1–3 en Mermaid: contexto, contenedores, componentes de la
  API por capability + capas) y `documents/ADR-0001-arquitectura-mvp.md` (ADR de
  arquitectura de la aplicación, estado **Propuesto**). El scheduler (recálculo de
  score, caducidad de ofertas, recordatorios) se modela como contenedor lógico,
  previsiblemente **in-process** en la API en el MVP. Se mantuvo el criterio "no
  inventar": frameworks concretos y hosting quedan como *pendiente/propuesto*. El
  prompt se archivó en `prompts.md` §2.1.
- **Frontend — separación de superficies:** el principio se mantiene (Portal del
  Suscriptor y Back-office segmentados por rol; el código de back-office no viaja
  al navegador del suscriptor sin autorización), pero con **Next.js** el mecanismo
  ya **no** es un *chunk lazy* de SPA sino **route groups + middleware de auth** y
  el *code-splitting* por ruta nativo de Next (`ADR-0001` §2–§3, decisión
  2026-07-05 que supersede la "opción 2 de 3 / SPA única" del 2026-07-04). La capa
  compartida (tipos, dominio, cliente OpenAPI) se factoriza para dejar barata una
  futura extracción de la API. Los specs de comportamiento (`accounts-roles`) no
  cambian: el acceso al back-office ya es por rol.
- **Visitante = actor no autenticado (decidido 2026-07-05):** el visitante (usuario
  sin sesión) se modela como **actor no autenticado**, **no** como un cuarto rol de
  `User` (los tres roles siguen siendo `SUBSCRIBER|OPERATOR|ADMIN`, uno por cuenta;
  el enum `Role` no cambia). Puede ver una **proyección pública** del catálogo
  (atributos de Sets publicados, **sin** disponibilidad ni cola), los planes/
  condiciones y el alta; la disponibilidad y todo lo de nivel copia/cola exigen
  login. La frontera se traza en la proyección de datos, no en el catálogo. Registro
  en `design.md` **D13**; specs `accounts-roles` (Requirement "Acceso público no
  autenticado") y `catalog-inventory` (Requirement "Proyección pública del
  catálogo"); PRD §3/§4.1/§14.1 (UC-P02 ya no muestra disponibilidad al visitante);
  historia **HU-00** en `documents/user_stories.md`; tareas 2.7 y 3.6.
- **Stack de UI (decidido 2026-08-11):** **Tailwind CSS + shadcn/ui** (componentes
  sobre **Radix UI**, copiados al repo en `components/ui/*`, sin lock-in y con
  tree-shaking perfecto). Elegido por: peso mínimo en móvil (Tailwind purga clases,
  **cero runtime CSS-in-JS**), accesibilidad AA de serie vía Radix (foco/ARIA/teclado
  — alineado con el objetivo WCAG 2.1 AA), estética moderna y encaje nativo con App
  Router/RSC. Theming por CSS variables (encaja con el modelo `Theme`). Iconos con
  **lucide-react**. Formularios con **react-hook-form + Zod**, **compartiendo los
  esquemas Zod con la API** (Route Handlers → OpenAPI). Descartados MUI/Chakra
  (runtime CSS-in-JS, fricción con RSC) y Mantine (más bundle, menos idiomático RSC).
- **Stack de tests (decidido 2026-08-11):** **Vitest** (unit/integración, ESM-nativo),
  **Playwright** (E2E — recorridos de tareas 5.7/8.4 y checks de accesibilidad) y
  **Testcontainers** para levantar **Postgres real** en integración (evita mocks de
  Prisma; prueba de verdad las transiciones de estado de `Copy` y el CAS/orden de la
  cola). "Tests no negociables": priorizar caminos de error y casos límite.
- **Versión de Prisma (decidido 2026-08-11):** **Prisma 7.** Implica **migrar la
  config del datasource** de `url = env("DATABASE_URL")` (forma clásica en el
  `schema.prisma` actual) a **`prisma.config.ts`**, requisito de Prisma 7. Hacerlo al
  inicializar el backend (afecta a la tarea 1.2). Supersede la nota previa de "pinnear
  Prisma 6".
- **Scaffolding hecho (tarea 1.1, 2026-08-11):** proyecto **Next.js 16** (App Router,
  TS, `type: module`) en la **raíz** del repo (no `backend/`; el schema se movió a
  `prisma/schema.prisma`). Stack instalado: **React 19.2, Tailwind v4** (config
  CSS-first en `app/globals.css`, sin `tailwind.config`), **shadcn/ui** (new-york,
  base neutral; `components.json`; `lib/utils.ts` con `cn`; primer componente
  `components/ui/button.tsx`), **Prisma 7.9** (generator nuevo `prisma-client` →
  `src/generated/prisma`, gitignored; **driver adapter** `@prisma/adapter-pg`; URL en
  `prisma.config.ts`), **Zod 4 + react-hook-form**. Estructura: route groups
  `app/(public)` (landing pública), `app/(portal)/portal`, `app/(backoffice)/backoffice`;
  API `app/api/health`; **`proxy.ts`** (Next 16 renombró `middleware`→`proxy`) como
  esqueleto de auth por rol; capas `src/domain` (incl. `reservation-queue/ordering.ts`
  puro, alineado con D11), `src/use-cases`, `src/repositories` (READMEs con la regla de
  dependencias), `src/db/prisma.ts` (singleton con adapter); `scheduler/index.ts`
  (proceso node-cron aparte). Tests: **Vitest** (jsdom + Testing Library; 6 tests humo
  en verde) + **Playwright** (`e2e/smoke.spec.ts`; falta `npx playwright install`).
  Scripts npm: `dev/build/start/lint/typecheck/test/test:e2e/db:generate/db:migrate/
  db:seed/scheduler`. **Verificado en verde:** `prisma generate`, `tsc --noEmit`,
  `eslint .`, `next build` (5 rutas), `vitest run`, y runtime real (`/api/health` →
  `{status:"ok"}`, landing y `/portal` 200). `.gitattributes` fuerza LF.
  **Caveats:** (1) `testcontainers@12` pide **Node ≥22.22** (hay 22.19) → subir Node
  antes de los tests de integración con Postgres; (2) ESLint 9: `eslint-config-next` 16
  se importa como **flat config nativo** (`eslint-config-next/core-web-vitals` +
  `/typescript`), **no** vía `FlatCompat` (daba error de estructura circular).
- **Postgres local con Docker (2026-08-11):** `docker-compose.yml` en la raíz levanta
  **postgres:16-alpine** con las credenciales de `.env.example`
  (`clickoteca:clickoteca@localhost:5432/clickoteca`), volumen `pgdata` y puerto
  publicado **solo en `127.0.0.1`** (ADR-0001 §5). Uso: `docker compose up -d`;
  `down -v` borra los datos. La instalación local de Node es **v24.19**, así que el
  caveat de Testcontainers (≥22.22) queda resuelto.
- **Tareas 1.2 y 1.3 hechas (2026-08-11):** schema afinado y **primera migración**
  `init` aplicada (22 modelos / 18 enums, 22 tablas). Cambios sobre el borrador:
  (1) **`Session`** — la tabla de sesiones que exige ADR-0002 §1 faltaba; guarda el
  **hash** del token de cookie, no el token; (2) **`Set.setNum`** único y opcional,
  referencia de Rebrickable para trazar la procedencia y hacer idempotente la
  semilla; (3) **índice único parcial** `reservation_offers_one_active_per_copy`
  (`WHERE status = 'PENDING'`) escrito **a mano en el SQL de la migración**, porque
  Prisma no expresa índices parciales — es el invariante multi-fila de D12.
  **Semilla** (`prisma/seed.ts`, idempotente vía upsert/find-si-falta): 2 planes,
  7 `SystemSetting`, 5 usuarios (uno por rol; suscriptores con 8 meses / 1 mes / sin
  suscripción para ejercitar D7), 20 temas, 35 sets y 61 copias con su
  `CopyStateTransition`. Solo se siembran estados de copia que existen **sin**
  `Rental` (INTAKE/DISPONIBLE/INCOMPLETA/BAJA). El catálogo real vive commiteado en
  `prisma/seed-data/sets.json` (extraído de los CSV públicos de Rebrickable) para
  sembrar **sin red**; edad/dificultad/valor son curados a mano.
  **Hashing**: `@node-rs/argon2` (prebuilds, sin compilador) en
  `src/domain/auth/password.ts` — argon2id con parámetros OWASP explícitos. Ojo:
  `Algorithm` es un `const enum` ambiente y con `isolatedModules` hay que importarlo
  como tipo y usar el literal `2`.
  **Verificado en verde:** `tsc --noEmit`, `eslint .`, `vitest run` (6), `next build`,
  y la semilla relanzada dos veces sin duplicar filas.
  **Caveat de flujo:** `prisma migrate dev` **aborta en entorno no interactivo** en
  cuanto tiene un warning que confirmar (p. ej. añadir un `@unique`). Con la base
  vacía la salida fue rehacer el `init`; en adelante, `--create-only` + revisar el
  SQL a mano.
- **Tarea 2.1 hecha — autenticación (2026-08-11):** sesión opaca server-side según
  ADR-0002 §1. Piezas: dominio puro en `src/domain/auth/` (`session.ts` genera token
  base64url de 32 bytes y lo hashea con **SHA-256** — no argon2: el token ya tiene
  256 bits de entropía y hay que resolverlo en cada petición; `roles.ts` con la
  frontera rol→superficie; `password.ts` con argon2id); puerto
  `src/repositories/auth.repository.ts` + adaptador Prisma; casos de uso
  `src/use-cases/auth/{login,logout,authenticate}.ts` con **dependencias por
  parámetro** (repositorio + reloj inyectable). HTTP: `app/api/auth/{login,logout,
  session}`, `src/http/problem.ts` (**mapa centralizado `code` → status** del
  contrato RFC 9457), `src/http/session-cookie.ts`, `src/http/auth-context.ts`
  (`currentSession`/`requireSession`/`requireSurface`/`requireSurfacePage`).
  Página `/login` mínima + `LogoutButton`.
  **Decisiones:** (1) email desconocido y contraseña incorrecta devuelven el **mismo**
  código y mensaje **y el mismo coste de CPU** (se hashea igualmente) para no ofrecer
  un oráculo de enumeración de cuentas; (2) la cuenta suspendida sí se distingue,
  pero **solo después** de acreditar la identidad; (3) `Secure` en la cookie solo en
  producción, porque el navegador descarta cookies `Secure` sobre `http://localhost`;
  (4) `authenticate` devuelve `null` en vez de lanzar — quien llama decide si eso es
  401, redirección o vista de visitante.
  **Hallazgo de Next 16:** el `proxy` corre **siempre en runtime Node**, así que
  puede consultar Prisma; declarar `export const runtime` allí es **error de build**
  ("Route segment config is not allowed in Proxy file"). Esto permite cumplir
  ADR-0002 al pie de la letra (la autorización por rol vive en el proxy).
  **Ojo con ESLint:** una función que se llame `useAlgo()` fuera de un componente
  dispara `react-hooks/rules-of-hooks` aunque no sea un hook.
  **Verificado:** `tsc`, `eslint`, `vitest` (40) y `next build` en verde, más flujo
  real contra la base sembrada — login, cookie, hash en BD (nunca el token), 401/422
  con `application/problem+json`, redirección por rol en ambos sentidos y logout que
  **borra la fila** de sesión.
- **Tarea 2.2 hecha — matriz de permisos (2026-08-11):**
  `src/domain/auth/permissions.ts` es la **fuente única de verdad** de la
  autorización: 15 permisos (`portal.access`, `copy.retire`, `settings.manage`…)
  mapeados a los 3 roles según la tabla de **PRD §3**. `ADMIN` se construye
  extendiendo `OPERATOR` (`[...OPERATOR_PERMISSIONS, …]`), de modo que una acción
  nueva del operador no puede quedarse sin dársela al admin. `roles.ts` ya **no**
  tiene su propia tabla rol→superficie: `canEnterSurface` se deriva de la matriz
  (`portal.access` / `backoffice.access`) — la dependencia `roles.ts → permissions.ts`
  es de runtime y la de vuelta es **solo de tipo** (`import type { Role }`), así que
  no hay ciclo. Guarda `requirePermission()` en `src/http/auth-context.ts`: los
  handlers preguntan por la **acción**, nunca por el rol. `GET /api/auth/session`
  devuelve también `permissions[]` (conveniencia de interfaz; el servidor los
  recomprueba en cada petición). Tests: la matriz completa, permitidos **y**
  denegados, más la invariante admin ⊇ operador y "sin rol, ningún permiso".
- **Tarea 2.3 hecha — baja de copia solo admin (2026-08-11):** `POST
  /api/copies/{copyId}/retire`. El permiso se comprueba **dos veces**: en el borde
  (`requirePermission("copy.retire")`) y dentro del caso de uso, porque
  `retireCopy` también es invocable desde el scheduler u otro caso de uso, donde no
  hay handler que haya filtrado. **Primer uso real del patrón CAS de D12**: el
  adaptador Prisma lee el estado, hace `updateMany({where:{id, state: leído}})` y si
  `count === 0` devuelve conflicto → 409 `COPY_STATE_CONFLICT`; la
  `CopyStateTransition` se escribe en la **misma transacción** que la baja.
  El repositorio devuelve un **tipo discriminado** (`retired | not_found |
  already_retired | conflict`) en vez de lanzar: quién traduce eso a HTTP es el caso
  de uso. Motivo de baja **obligatorio** (mín. 3 caracteres): es parte del rastro de
  auditoría, no un adorno. `src/domain/copy/lifecycle.ts` declara los 9 estados y
  `canRetire` (cualquiera salvo `BAJA`, terminal) — la tabla completa de transiciones
  es la 3.2.
  **Verificado en caliente:** 403 al operador (sin tocar la BD), 401 sin sesión, 422
  sin motivo, baja correcta con `retiredAt` y auditoría (autor + motivo + fecha), 409
  al repetir, y **carrera de 5 peticiones simultáneas → 1 baja, 4 conflictos y una
  sola fila de auditoría**.
  **Aviso para pruebas manuales:** Git Bash en este equipo envía los literales
  no-ASCII mal codificados; para probar acentos hay que mandar el payload con
  `--data-binary @fichero`. La app sí maneja UTF-8 correctamente (comprobado).
- _(More facts to be added as the project develops.)_

## Open questions

- _(Ninguna abierta.)_ Arquitectura, hosting, auth, UI, tests y versión de Prisma
  cerrados; **bloque 1 (Fundaciones) completo**: scaffolding (1.1), modelo de datos y
  primera migración (1.2) y semillas (1.3), todo verificado. Bloque 2 en curso: 2.1
  (autenticación), 2.2 (matriz de permisos) y 2.3 (baja de copia solo admin) hechas.
  Siguiente: 2.4 (auditoría "quién/cuándo" generalizada — la transición a `BAJA` ya la
  registra; falta el `AuditLog` genérico de acciones admin).

_(Cerradas: framework front+back → **Next.js full-stack** (App Router), API REST en
Route Handlers + OpenAPI (`ADR-0001` §2–§3, 2026-07-05); hosting → VM única Oracle
free (`ADR-0001` §5); auth → cookie de sesión
+ contrato de errores RFC 9457 (`ADR-0002`); concurrencia → CAS y orden de cola
inmutable (`design.md` D11 rev / D12).)_

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
