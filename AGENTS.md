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
- **Tarea 2.4 hecha — auditoría (2026-08-11):** las **dos vías de D10**, que no se
  solapan (una baja de copia se registra como transición, **no** como `AuditLog`).
  (a) **Transiciones de copia:** `applyTransition` en `copy.repository.prisma.ts` es
  el **único camino** por el que cambia el estado de una copia — une el CAS de D12 y
  la escritura de `CopyStateTransition` en un solo movimiento dentro de la
  transacción. Mientras todo pase por ahí, es imposible dejar una copia en estado
  nuevo sin saber quién la movió; y como la firma exige `actorId`, tampoco cabe
  registrar de forma anónima. Las tareas 3.x deben reutilizarlo en vez de escribir
  `copy.update({state})` a pelo.
  (b) **Acciones administrativas:** `src/domain/audit/actions.ts` con **uniones
  cerradas** (9 acciones, 5 tipos de entidad) pese a que la columna es `String`, para
  que el valor signifique lo mismo dentro de un año; puerto `AuditRepository` +
  adaptador Prisma; `metadata` guarda el **antes/después** (sin ella la auditoría
  diría que algo cambió pero no qué).
  **Estado:** el `AuditLog` genérico **todavía no tiene emisores** — las acciones que
  lo usarán (configurar reglas/planes, gestionar empleados, publicar sets) son 4.x y
  8.2. Está verificado contra la base real (escritura, orden descendente, aislamiento
  por entidad, `metadata` nula, round-trip de acentos) para que no llegue sin probar.
  **Truco de verificación:** los adaptadores Prisma no los cubren los dobles; se
  comprueban con un script `tsx` temporal **dentro** del proyecto (los alias `@/` no
  resuelven si el script vive fuera) que limpia sus propias filas al terminar.
- **Tarea 2.5 hecha — alta de suscriptor (2026-08-11):** `POST /api/auth/register` +
  página `/registro` (la landing ya la enlazaba y daba **404**). Usuario, dirección y
  método de pago se crean **en una transacción**. Los tres requisitos del alta
  (mayoría de edad, condiciones, dirección de envío) se validan también en el caso de
  uso, y los fallos se **acumulan** en `errors[]` en vez de devolver el primero.
  Nuevo `User.acceptedTermsAt` (migración `user_accepted_terms`). La tarjeta es
  simulada y **nunca se pide el PAN**; el "contacto" de la spec lo cubre el email del
  usuario, así que no se añadió columna de teléfono. El email duplicado se responde
  como `VALIDATION_ERROR` del campo `email` — se acepta que revela qué emails existen,
  porque en un alta es inevitable y, a diferencia del login, no hay credencial que
  proteger.
  **Dos trampas encontradas (ambas solo visibles en runtime):**
  1. **`prisma migrate dev` NO regenera el cliente** en Prisma 7 → la app falla con
     "Unknown argument" pese a que `tsc` y `next build` pasan. Arreglado de raíz:
     `db:migrate` es ahora `prisma migrate dev && prisma generate`.
  2. **Con driver adapter, el error P2002 no trae `meta.target`**, solo
     `meta.modelName` — la detección del email duplicado por `target` nunca acertaba y
     devolvía 500. `isUniqueEmailViolation` cubre las dos formas y está testeada.
  **Lección:** `tsc` + `build` + tests con dobles **no** detectan estos fallos; los
  adaptadores Prisma hay que ejercitarlos contra Postgres.
- **Tareas 2.6 y 2.7 hechas — bloque 2 completo (2026-08-11):** superficie pública del
  visitante (D13): `GET /api/catalog`, `/api/catalog/{setId}`, páginas `/catalogo` y
  `/planes`. **La proyección pública se define en el `select` de la consulta**, no
  filtrando después: `referenceValue` (coste de reposición), `published`, `restricted`
  y todo lo de nivel `Copy` no llegan siquiera a salir de la base, así que no pueden
  escaparse por descuido más arriba. Un Set **sin publicar responde 404 igual que uno
  inexistente**, para que no se pueda sondear el catálogo antes de publicarlo.
  El gating se extrajo del `proxy` a **`decideSurfaceAccess`** (`src/domain/auth/
  access.ts`): función pura rol×superficie → `allow | authenticate | redirect`, que se
  puede probar entera —incluido el visitante— sin levantar Next; el `proxy` solo
  ejecuta la decisión.
  `Terms` vive en `components/terms.tsx` porque lo usan `/registro` y `/planes`. **Ojo
  con el alias:** `@/` apunta a `src/`, no a la raíz, así que `@/app/...` no resuelve.
  **`/planes` lleva `dynamic = "force-dynamic"`**: Next la prerenderizaba en el build y
  congelaba unos precios que el admin puede cambiar (D9); de paso, `next build` deja de
  necesitar base de datos.
  **Estado: 111 tests / 12 ficheros**, con los cinco casos que pide 2.7 cubiertos.
- **Bloque 3 completo — `catalog-inventory` (2026-08-12):**
  **Corrección importante de la 2.3:** aquella permitía dar de baja desde *cualquier*
  estado salvo `BAJA`. La tabla de **PRD §15.5** solo contempla la baja desde
  `EN_INSPECCION`, `INCOMPLETA` y `ALQUILADA`, y la spec dice que se rechaza toda
  transición no contemplada. Ahora `canRetireFrom` deriva de la tabla. **Consecuencia:
  una copia `DISPONIBLE` que aparece rota NO se retira de golpe** — pasa por el camino
  de inspección, que es donde queda registrado el porqué. Si se quisiera una baja
  directa desde almacén, habría que **cambiar la spec**, no el código.
  Por lo mismo, el **seed ya no siembra `INCOMPLETA` ni `BAJA`**: a esos estados solo
  se llega pasando por un alquiler, así que sembrarlos creaba copias con un historial
  imposible. Ahora siembra `INTAKE` (11) y `DISPONIBLE` (48) — las de `INTAKE` son
  trabajo real de catalogación para el operador.
  **Piezas:** `COPY_TRANSITIONS` (14 transiciones con motivo, `driver` y permiso) es la
  fuente única; `transitionCopy` lee el estado → identifica la transición → comprueba
  **ese** permiso → CAS. No se puede validar el permiso antes de leer, porque depende
  del par origen→destino. Las transiciones con `driver: "system"` (cola y alquiler)
  **se rechazan desde el endpoint de back-office** aunque las pida un admin: moverlas a
  mano dejaría una copia `ALQUILADA` sin alquiler detrás.
  `POST /api/copies/{id}/transitions` es el endpoint genérico; `/retire` se mantiene
  por su semántica (motivo obligatorio) pero **delega** en `transitionCopy`.
  **`Set.referenceValue` ahora es opcional** (migración): si la base lo exigiera, la
  regla "no se publica sin valor de referencia" sería inalcanzable. Publicar/retirar
  del catálogo escribe `AuditLog` — **primeros emisores** del registro creado en 2.4.
  **Decimales:** usar `toFixed(2)` y no `toString()` al sacar un `Decimal` de Prisma;
  `toString()` devuelve `"99.9"` para 99.90.
  **Trampa de migración:** `npm run db:migrate -- --name X` **se cuelga** (el `--` con
  el `&&` del script). Camino fiable: `npx prisma migrate dev --name X --create-only`,
  revisar el SQL, `npx prisma migrate deploy` y `npx prisma generate`.
- **Bloque 4 completo — `subscriptions` (2026-08-12):**
  **Idea central:** la regla "no hay set nuevo hasta completar la devolución" **no es
  una comprobación aparte**. La plaza del plan no se libera al iniciar la devolución
  sino cuando la copia vuelve a `DISPONIBLE` (`OCCUPYING_COPY_STATES` = `ALQUILADA` +
  los tres estados de retorno), así que la regla se cae del propio límite. El motivo
  devuelto sí distingue `RETURN_IN_PROGRESS` de `PLAN_LIMIT_REACHED`, porque la acción
  que resuelve cada caso es distinta. Ojo: **solo `ALQUILADA` significa "lo tienes en
  casa"**; cualquier otro estado que ocupe plaza es una devolución en marcha.
  Para **pausar/cancelar** el conjunto es más estrecho (`HELD_COPY_STATES` =
  `ALQUILADA` + `EN_DEVOLUCION`): si la copia ya está en inspección, el suscriptor
  cumplió y retenerle la suscripción por nuestro proceso interno sería injusto.
  `SystemSetting` se lee por `resolveSettings`, **tipado y con valores por defecto**:
  un dato corrupto en la base no puede dejar sin criterio a una regla de negocio.
  Scheduler: primer job real (recordatorios de retención, diario a las 10:00, con
  guarda anti-solape). La última fecha de recordatorio se **deduce de las
  notificaciones** ya enviadas, sin columna extra que mantener en sincronía.
  **Tres fallos que solo aparecieron al probar:**
  1. `Number(null) === 0` — un `null` en `SystemSetting` se colaba como 0 válido y
     ponía un parámetro a cero. `toUsableNumber` descarta `null`/`undefined`/`""`.
  2. La auditoría de planes registraba el valor **nuevo** como anterior, porque
     `before` era una referencia al objeto que el repositorio mutaba. Ahora se copia.
  3. **`AuditLog.entityId` es una columna UUID**: pasarle `"PREMIUM"` reventaba la
     inserción con un 500 *después* de haber actualizado el plan. Las claves legibles
     van en `metadata`, nunca en `entityId`.
  **Mensajes de Zod:** poner siempre el texto explícito (`.min(1, "…")`); si no, el
  mensaje en inglés de Zod acaba llegando al usuario dentro de `errors[]`.
- **Bloque 5 completo — `rentals-returns` (2026-08-12):**
  **Decisión estructural:** `applyTransition` (ahora en `src/repositories/
  copy-transitions.ts`, compartido) **sincroniza el `Rental` dentro de la misma
  transacción** que el cambio de estado de la `Copy`. Al derivarse uno del otro, no
  existe el instante en que la copia ya volvió pero el alquiler sigue diciendo que
  está fuera. Solo tres estados mueven el alquiler: `EN_DEVOLUCION` →
  `RETURN_INITIATED`, `EN_INSPECCION` → `IN_INSPECTION`, `DISPONIBLE`/`BAJA` →
  `COMPLETED`.
  **Asignación:** recorre las copias libres por antigüedad y reserva con CAS; si otro
  se adelanta, **reintenta con la siguiente** en vez de fallar. Sin copias responde
  200 con `canQueue`, no un 4xx: la spec dice que se le *ofrece* la cola.
  **Conformidad tácita: no se persiste.** Es la ausencia de discrepancia pasada la
  ventana y se deduce de lo ya registrado; guardarla obligaría a un proceso que la
  escribiera y a mantenerla en sincronía sin añadir información.
  **A1 (D3):** la oferta a la cola se dispara **solo** al quedar `DISPONIBLE`, nunca
  durante la inspección — ofrecer antes obligaría a des-prometer el set si resultara
  estar incompleto. El recorrido salta a los no elegibles **sin sacarlos de la cola**.
  **Hueco que encontró un test:** `requestSet` aplicaba `checkEligibility`, que exige
  suscripción activa, así que **el alquiler puntual era imposible**. Ahora son dos
  vías: `checkEligibility` (plan) y `checkOneOffEligibility` (un set a la vez, set
  tasado, y **sets restringidos fuera** — la antigüedad mínima existe para no entregar
  lo más valioso a quien no tiene historial, y un alquiler puntual es justo ese caso).
  **Fakes:** `FakeCopyRepository.onTransition` reproduce la sincronización del
  alquiler que en el adaptador real ocurre dentro de `applyTransition`; sin ese
  cableado los dobles mienten sobre el comportamiento real.
- **Bloque 6 completo — `reservation-queue` (2026-08-12):**
  **Al encolar sí se comprueba la antigüedad, pero no el tope de plan.** Encolarse
  para más adelante es legítimo aunque ahora tengas el máximo fuera; la elegibilidad
  se vuelve a mirar al ofrecer (D5), que es cuando importa. En cambio dejar entrar a
  quien nunca podrá aceptar el set solo alarga la cola a costa de los demás.
  **Re-encolado tras caducar:** `effectiveEntryOnRequeue = ahora + penalización`, y
  **sin volver a aplicar el bono del plan** — el bono premia entrar en la cola, no
  volver tras desatender un turno; sumarlo podría colocar a un premium por delante de
  quien no ha fallado a nada.
  **Bug que encontró un test:** al caducar una oferta, la copia se le **volvía a
  ofrecer a la misma persona** que no había respondido, porque tras re-encolarse era
  la única en espera → bucle infinito que vaciaba la penalización.
  `offerToHeadOfQueue` acepta ahora `excludeEntryId`: "pasa al siguiente" significa al
  siguiente.
  **Rechazo vs caducidad:** rechazar saca de la cola (dijo que no); caducar re-encola
  (no responder no es renunciar). Los dos liberan la copia en el acto.
  El scheduler corre `expireOffers` + `sendOfferReminders` juntos cada 5 min: miran
  las mismas filas y separarlos duplicaría el sondeo.
  `NotificationRepository` mínimo creado aquí para el recordatorio de oferta; el motor
  por eventos es el bloque 7.
- **Bloque 7 completo — `notifications` (2026-08-12):**
  **La no-duplicación no depende del código.** Cada aviso lleva una `dedupeKey`
  derivada del evento (`QUEUE_TURN:<offerId>:<userId>`) y un **índice único** en
  `notifications` la rechaza (migración `notification_dedupe_key`). El adaptador
  traduce el P2002 a `false`, que quien llama distingue de "enviada". Comprobar antes
  de insertar dejaría una ventana en la que dos ejecuciones simultáneas verían "no
  existe" a la vez.
  **Excepción deliberada:** `RETENTION_REMINDER` lleva el **ciclo** en la clave
  (`:2026-08-12`), porque ese aviso *debe* repetirse cada X días; sigue impidiendo dos
  envíos dentro del mismo ciclo.
  **`emit()` nunca propaga errores.** Notificar es un efecto secundario: que no se
  pueda avisar no puede tumbar el alquiler, la devolución o la baja que ya ocurrieron.
  Los emisores reciben `emit?` **opcional**, así los tests que no lo necesitan no se
  acoplan al motor.
  El mapa evento→avisos es una **función pura** (`notificationsFor`), lo que permite
  testear el catálogo entero sin base ni transporte.
  **Cuidado con los rodeos:** al principio el aviso `QUEUE_TURN` sacaba el nombre del
  set del último alquiler de la copia, y eso rompía el re-ofertado (una copia puede no
  tener historial). El nombre sale ahora de la propia entrada de cola
  (`QueueEntryCandidate.setName`).
  **Migración con índice único:** vuelve a disparar el prompt interactivo de
  `migrate dev`; se escribió el SQL a mano en `prisma/migrations/` y se aplicó con
  `migrate deploy`.
- **Bloque 8 completo — back-office y cierre (2026-08-12). MVP terminado: 45/45.**
  Pantallas: `/backoffice` (cola de trabajo por estado, lo más antiguo primero),
  `/backoffice/clientes[/:id]`, `/backoffice/configuracion`, `/backoffice/empleados` y
  `/portal` (sets, colas, ofertas y avisos del suscriptor).
  **El recorte de la ficha de cliente vive en el caso de uso** (`projectCustomer`), no
  en las páginas: si cada pantalla decidiera qué ocultar, bastaría con olvidarlo una
  vez. El operador ve situación e historial —lo que necesita para soporte— pero no
  email, dirección ni fecha de alta.
  **Un admin no puede cambiarse el rol ni suspenderse a sí mismo**: dejaría el sistema
  sin nadie capaz de deshacerlo.
  **E2E:** `e2e/circuito-completo.spec.ts`, 8 tests, con el circuito entero por
  interfaz. Corre **en serie** (`describe.configure({ mode: "serial" })`) contra la base
  sembrada, porque comparte estado; paralelizarlo haría que dos pruebas se disputaran
  las mismas copias. Tras ejecutarlo hay que **limpiar y resembrar**: deja alquileres,
  ofertas y notificaciones.
  **Orden de borrado por claves foráneas** al limpiar: offers → queue_entries →
  shipments → condition_reports → incidents → rentals → notifications → audit_logs →
  sessions → copy_state_transitions → copies.
  **CLI de OpenSpec:** el paquete es **`@fission-ai/openspec`** (el `openspec` de npm es
  un placeholder 0.0.0). Añadido como devDependency; `npm run spec:validate`.
  **Prisma:** dentro de un objeto `as const`, un array literal se vuelve `readonly` y
  Prisma lo rechaza en un filtro `in`; hay que referenciar una variable `Type[]`.
- **Flujos por rol — primer entregable de UX (2026-08-16):**
  `documents/ux-flows.md` (actores y superficies, mapa de navegación, **15 diagramas
  Mermaid** de flujo por rol + el scheduler como actor invisible, tabla de cobertura
  HU → flujo → pantalla, decisiones pendientes). Método: cruzar `user_stories.md` ×
  specs/PRD × **el código de `app/`**; ese tercer eje es el que aporta información
  nueva. `PRD.md` §9 pasa de "pendiente" a apuntar aquí.
  **Lo que reveló el cruce — solo 8 de 18 historias tienen recorrido por interfaz:**
  1. **HU-02 (contratar plan) no existe en ninguna capa.** `PUT
     /api/subscriptions/me` solo cambia el estado (`ACTIVE|PAUSED|CANCELLED`) de una
     suscripción **ya existente**, y `register-subscriber.ts` **no crea ninguna**:
     las únicas suscripciones del sistema son las de `prisma/seed.ts`. Un usuario que
     se registre en la app real nunca podrá alquilar. Es funcionalidad ausente, no un
     hueco de diseño — **decidir si entra en alcance**.
  2. **No hay ficha de set `/catalogo/:id`.** El catálogo es una rejilla sin destino,
     así que `POST /api/sets/:id/rentals` y `POST /api/sets/:id/queue` (HU-03/HU-04,
     el flujo central) no tienen desde dónde ejecutarse, y D13 —la frontera entre la
     proyección pública y la autenticada— no se hace visible en ninguna pantalla.
  3. **Sin UI:** registro de condición (HU-11) y discrepancia (HU-07) — que solo
     tienen sentido como par—, pausar/cancelar (HU-09), alta de set y de copia
     (HU-10, no hay pantalla de catálogo en back-office), edición de planes y
     recordatorios de retención (HU-16), historial y posición en cola (HU-06).
  4. **Las copias `ALQUILADA` pendientes de envío no salen en la cola de trabajo**
     (`ORDER` en `app/(backoffice)/backoffice/page.tsx` no incluye ese estado): el
     operador no tiene forma de saber que hay un set esperando a prepararse.
  **Decisiones de UX ya tomadas en el código que el diseño debe respetar, no
  reinventar:** rol equivocado → **redirección** a su superficie, nunca un 403 sin
  salida; al operador se le **muestra** "Dar de baja" y recibe 403 al pulsarlo (mejor
  que esconder acciones sin explicar); los errores del alta se **acumulan** en
  `errors[]`; "sin copias" responde **200 con la oferta de cola**, no un 4xx.
  **Validación de diagramas:** no hay mermaid en el repo; se valida aparte con
  `mermaid.parse` + `jsdom` (mermaid necesita DOM; sin él falla con
  "DOMPurify.addHook is not a function").
- **Decisión de alcance (2026-08-16) — el plan entra en el alta y el alquiler puntual
  sale:** primera decisión salida de la revisión de flujos (`ux-flows.md` §8.1).
  (1) **HU-01 absorbe la elección de plan**: no existe "cuenta sin plan"; usuario,
  dirección, método de pago **y suscripción** se crean en la misma transacción.
  (2) **HU-02 pasa a ser *cambio* de plan** BASIC ⇄ PREMIUM sobre una suscripción
  existente: inmediato al subir; al bajar, **rechazado mientras tenga más sets
  ocupando plaza de los que permite el plan nuevo** —mismo criterio que
  pausar/cancelar, y por la misma razón: se cae del límite de plazas—. El
  `appliedBonus` de las colas vivas **no se recalcula** (D11), así que subir de plan
  no adelanta esperas en curso.
  (3) **El alquiler puntual sin suscripción sale del alcance**: alquilar exige plan.
  **Documentos ya sincronizados:** `user_stories.md` (HU-01/HU-02/HU-16 + notas),
  `PRD.md` (§1, §4.3, §5, §6, UC-P05, UC-B10, §15 rationale) y `ux-flows.md`.
  **Recogida en OpenSpec (2026-08-16)** como el cambio **`plan-obligatorio-en-alta`**
  (proposal + 3 delta specs + design + 18 tareas, `validate --strict` en verde,
  **sin implementar**). Deltas: `subscriptions` (ADDED "Suscripción activa desde el
  alta", "Cambio de plan" y "Precio de los planes"; REMOVED "Alquiler puntual sin
  suscripción" y "Precio de los planes y del alquiler puntual"), `rentals-returns`
  (MODIFIED "Solicitud y asignación de un set" → exige suscripción activa) y
  `accounts-roles` (MODIFIED "Titularidad adulta" → el alta incluye elegir plan).
  Decisiones de `design.md` que no están en las specs: el downgrade se mide con
  **`OCCUPYING_COPY_STATES`**, no con el conjunto más estrecho de pausar/cancelar
  —si no, un BASIC podría quedarse por encima de su propio límite—; la suscripción se
  crea **dentro** de la transacción del alta delegando en el caso de uso de
  suscripciones; y **el esquema no se toca**: `Rental.subscriptionId`, `Rental.price`
  y `Payment` se quedan y simplemente dejan de poblarse (`RentalType` siempre
  `SUBSCRIPTION`).
- **OpenSpec: el MVP ya está archivado y hay línea base (2026-08-16).** `clickoteca-mvp`
  se archivó en `openspec/changes/archive/2026-08-16-clickoteca-mvp/` y sus **32
  requisitos** pasaron a `openspec/specs/` (6 capabilities). Antes de esto `specs/`
  estaba **vacío**, así que ningún delta de tipo MODIFIED/REMOVED podía validarse: si
  vuelve a hacer falta un cambio, **archivar primero** el completo.
  **Caveats aprendidos:**
  (1) `npx openspec archive <name> --yes` aplica los deltas y mueve el directorio en
      un solo paso; deja el `## Purpose` de cada spec como `TBD - ... Update Purpose
      after archive` → **hay que rellenarlo a mano** (ya hecho para las 6).
  (2) El validador **rechaza RENAMED junto a MODIFIED sobre el mismo requisito**. Para
      renombrar *y* cambiar contenido, usar **REMOVED + ADDED** con nombres distintos
      (así se hizo con "Precio de los planes").
  (3) `MODIFIED` exige **copiar el bloque entero** del requisito (cabecera + todos los
      escenarios) y editarlo; con contenido parcial se pierde detalle al archivar.
  (4) `npm run spec:validate` apuntaba al cambio ya archivado y **fallaba**; ahora es
      `openspec validate --all --strict`.
- **`plan-obligatorio-en-alta` implementado (2026-08-17) — 18/18 tareas.** El alta crea
  usuario, dirección, tarjeta **y suscripción `ACTIVE`** en la misma transacción; existe
  el cambio de plan `BASIC ⇄ PREMIUM`; y el alquiler puntual sale entero (dominio,
  ajustes e interfaz). **275 tests unitarios + 10 E2E en verde**, `tsc`, `eslint`,
  `next build` y `openspec validate --all --strict` también.
  **Desviación consciente sobre `design.md` §1:** el diseño pedía "delegar en el caso de
  uso de suscripciones" la creación de la suscripción, pero la transacción vive en el
  **adaptador** `subscriber.repository.prisma.ts` y meter un caso de uso dentro de un
  `$transaction` de Prisma rompería la dirección de dependencias. Lo que se hizo: el
  alta resuelve y valida el plan contra el **puerto** `SubscriptionRepository.listPlans()`
  y le pasa al adaptador un `subscription: { planId, startedAt }` ya resuelto; el
  adaptador solo escribe. El alta orquesta sin reimplementar, y la atomicidad es real.
  **Dos códigos de error nuevos** (`ErrorCode` es cerrado, así que ampliarlo es la vía):
  `NO_ACTIVE_SUBSCRIPTION` (409, alquilar sin plan) y `PLAN_DOWNGRADE_BLOCKED` (409,
  bajar de plan con sets fuera; el detalle **dice cuántos devolver**). Separarlos de
  `NOT_ELIGIBLE` importa porque lo que resuelve cada caso es distinto.
  **`canSwitchToPlan` no bifurca por dirección del cambio**: compara lo que ocupa plaza
  (`OCCUPYING_COPY_STATES`) con el `maxSimultaneousSets` del plan **destino**, así que
  subir pasa solo y bajar se mide con el mismo criterio que la elegibilidad.
  **Trampa de Zod encontrada con el E2E:** `planCode: z.string(msg)` deja pasar la
  cadena vacía, así que el error del plan **no** salía junto al resto —el esquema del
  borde cortaba antes de llegar al caso de uso—. Hace falta `.min(1, msg)`; el mensaje
  del caso de uso ("El plan elegido no está disponible.") queda para el código
  desconocido o retirado, que sí llega hasta él.
  **Semilla:** Carla pasa a tener suscripción **CANCELLED** (no "sin ninguna fila"):
  desde este cambio no existe la cuenta de suscriptor sin suscripción, así que sembrarla
  sin ninguna contradiría la spec. Es el fixture del rechazo `NO_ACTIVE_SUBSCRIPTION`.
  Las filas viejas de `SystemSetting` del puntual **siguen en la base** pero son
  inertes: `resolveSettings` solo lee el catálogo y `updateSetting` rechaza claves
  fuera de `SYSTEM_SETTING_KEYS`.
  **Trampa de verificación (perdida de tiempo evitable):** `playwright.config.ts` tiene
  `reuseExistingServer`, así que si queda un `next start` (build de producción) ocupando
  el 3000, el E2E prueba **el build viejo** y los fallos no tienen sentido. Matar el
  puerto 3000 antes de lanzar Playwright.
- **Sistema de diseño — segundo entregable de UX (2026-08-19):**
  `documents/design-system.md`, implementado en `app/globals.css` (tokens),
  `lib/status.ts` (vocabulario) y `components/ui/badge.tsx` + `components/status-badge.tsx`.
  **Decisiones que hay que respetar, no reinventar:**
  (1) **Dos familias de tokens y no se mezclan**: los semánticos de shadcn
  (`--primary`, `--muted`…) son el chasis; los `--tone-*` son el vocabulario de
  estados. Pintar una fila "pendiente" con `--destructive` convierte el rojo de
  "esto ha fallado" en ruido.
  (2) **Cinco tonos**: `neutral` (nada que hacer / archivado), `info` (en marcha, no
  depende de ti), `success`, `warning` (**te espera a ti**) y `danger`. Cada uno con
  tres tokens (fondo, texto, borde) porque en oscuro un fondo tintado sin borde
  desaparece.
  (3) **El tono mide la urgencia de quien lee, no el estado**: `EN_INSPECCION` es
  `warning` para el operador e `info` para el suscriptor. Y **la granularidad depende
  del rol**: los cuatro estados del circuito de devolución son un único "Devolución
  en curso" para el suscriptor.
  (4) `--highlight` (el amarillo de marca) **no es un color de acción**: no lleva
  texto de botón ni compite con `primary`.
  **Ninguna pantalla escribe la etiqueta de un estado a mano** — sale de
  `lib/status.ts`, y `tests/status.test.tsx` lo comprueba **leyendo
  `prisma/schema.prisma`**: un enum nuevo sin etiqueta pone la suite roja en vez de
  sacar `EN_CUARENTENA` a producción.
  **El contraste se mide, no se promete:** `tests/design-tokens.test.ts` parsea
  `globals.css`, calcula OKLCH→sRGB→ratio WCAG y exige 4.5:1 (texto) / 3:1 (bordes de
  control y foco) en **los dos temas**, más que todo color quepa en gamut sRGB y que
  ningún token del claro se quede sin override en `.dark`.
  **Dos fallos reales de accesibilidad que encontró y que ya están corregidos:**
  `--input` (borde de control) no llegaba al 3:1 de WCAG 1.4.11 con el gris de
  fábrica; y el botón destructivo llevaba `text-white` fijo, que en oscuro se queda
  en **3.13:1** — de ahí el token nuevo `--destructive-foreground`. Además, los nueve
  mensajes de error usaban `text-red-600` (color de Tailwind ajeno al tema, 3.82:1 en
  oscuro) y ahora son `--destructive`.
  **Trampas encontradas:** (a) a **L≥0.93 el gamut sRGB se estrecha muchísimo** —el
  croma máximo del azul y el rojo cae a ~0.03, frente a 0.10 del verde—, así que los
  fondos de tono se calcularon con un solver en vez de a ojo; (b) bajo **jsdom**,
  Vitest reescribe `import.meta.url` a `http://…` y `fileURLToPath` lo rechaza: para
  leer ficheros en un test hay que usar `resolve(process.cwd(), …)`; (c) un comentario
  JSX **no puede ir entre `? (` y el elemento** de una ternaria.
  **Sin webfont a propósito**: `next/font` descarga en build y ataría el despliegue a
  la red (el destino es una VM libre de Oracle). Pila del sistema en `--font-sans`.
  **El tema oscuro está definido y medido, pero no conmutable**: nadie pone la clase
  `.dark` ni se lee `prefers-color-scheme`. Es deuda conocida.
  **El E2E dependía del texto de la interfaz**: renombrar los grupos de la cola de
  trabajo ("Pendientes de inspección" → "Por inspeccionar") rompía
  `circuito-completo.spec.ts`; actualizado.
- **El E2E, ejecutado de verdad contra Docker (2026-08-19).** Se levantó
  `clickoteca-db` y se corrió Playwright, que llevaba sin ejecutarse desde el sistema
  de diseño. Salieron **tres problemas, dos resueltos y uno abierto**:
  (1) **Regresión de copia mía:** el portal ya no dice "Plan actual: Premium" y el test
  lo afirmaba. Arreglado por el lado bueno: los bloques del portal son ahora
  `<section aria-labelledby>` —regiones con nombre accesible— y el test usa
  `getByRole("region", { name: "Tu plan" })`, así que sobrevive a los cambios de
  redacción. **Lección: cambiar copia rompe E2E; hay que correrlo, no solo `tsc`.**
  (2) **El circuito no era idempotente:** terminaba con Bruno quedándose el set, así
  que la **segunda** ejecución le encontraba en su límite de plazas y el
  `no_copy_available` que esperaba llegaba como `NOT_ELIGIBLE`. Sembrar no lo
  arreglaba —la semilla es idempotente y no borra—. Ahora el test **cierra el
  circuito** (Bruno devuelve; el operador recepciona, inspecciona e higieniza) y deja
  la copia `DISPONIBLE`. Verificado corriéndolo varias veces seguidas.
  Ojo: el residuo de ejecuciones viejas se limpió **por la API**, no con
  `copy.update({state})`, que se saltaría la máquina de estados.
  (3) **El proyecto `mobile` repetía el circuito entero** y competía con `chromium`
  por la misma copia (uno alquila, al otro le dicen que no quedan). Acotado a
  `testMatch: /smoke\.spec\.ts/`: lo que aporta el móvil es el viewport, no repetir un
  recorrido con estado compartido.
  **ABIERTO, pero con la causa localizada — el servidor de `next dev` se cae bajo la
  carga del E2E.** El síntoma eran timeouts intermitentes (~50% de las ejecuciones con
  los 5 workers por defecto) en `page.goto("/")` o `/catalogo`, esperando el evento
  `load` aunque el propio log del servidor dijera `200 in 50ms`. La pista definitiva
  llegó al pedir un endpoint a mano: `/api/catalog/:id` devolvía **HTML de error 500**
  con el mensaje `Jest worker encountered 2 child process exceptions, exceeding retry
  limit`. Es el **pool de workers interno de Next dev** muriéndose —probablemente por
  memoria, con cinco Chromium + el servidor + Docker en la misma máquina—; una vez
  degradado, unas rutas cuelgan y otras dan 500 hasta que se reinicia el servidor.
  Descartados por el camino: el estado de la base, el CDN de Rebrickable (sus imágenes
  ya se abortan en `e2e/fixtures.ts`) y el arranque en frío (hay `e2e/warmup.ts` y el
  timeout está en 60 s). **Con `--workers=1` es estable y rápido (7 s el smoke).**
  **Resuelto ese mismo día** por la segunda vía —el E2E ya no se ejecuta contra
  `next dev`—: ver la entrada siguiente.
- **El E2E, estable: se prueba el artefacto de despliegue (2026-08-19).** La
  inestabilidad del paralelismo estaba en `next dev`, no en las pruebas: su pool de
  workers moría bajo la carga y dejaba el servidor degradado. **La configuración ya no
  apunta a `next dev`**: `playwright.config.ts` hace `next build` y levanta el
  **paquete autónomo** (`output: "standalone"`) en el **puerto 3100** vía
  `npm run start:standalone` (`scripts/start-standalone.mjs`). Con eso, **14/14 en
  ~35 s con los 5 workers por defecto**, repetido varias veces sin un solo fallo.
  Cuatro decisiones que van juntas y no conviene deshacer por separado:
  (1) **Puerto propio (3100) y `reuseExistingServer: false`** — así un `next dev`
  abierto en el 3000 no puede colarse como servidor de pruebas, y un `start` viejo
  ocupando el puerto falla en voz alta en vez de servir un build anterior. Muere la
  trampa del build viejo.
  (2) **Se levanta lo que se despliega, no `next start`.** `next start` avisa de que no
  funciona con `output: standalone`, y con razón: el paquete autónomo **no incluye
  `.next/static`** —copiarlo es trabajo del despliegue—. El script hace esa copia (y la
  de `public` si existe) antes de arrancar `server.js`, que es exactamente el runbook de
  la VM (ADR-0001 §5).
  (3) **Hay una prueba que vigila esa copia** (`smoke.spec.ts`): si faltan los estáticos
  las páginas siguen respondiendo 200 y el evento `load` no se entera —un chunk caído no
  lo impide—, así que se mira el tráfico de `/_next/static/`. Verificado que no es vacua:
  borrando el directorio, ese chunk pasa de 200 a 500.
  (4) **`E2E_DEV=1`** sigue apuntando al servidor de desarrollo (puerto 3000, **un solo
  worker**, que es lo único que aguantaba) para iterar sobre una pantalla sin pagar el
  build en cada vuelta.
  El calentamiento (`e2e/warmup.ts`) ya no lleva el puerto a mano: lo lee del `baseURL`
  de la configuración.
- **`axe` en el E2E: la accesibilidad se audita sola (2026-08-19).**
  `e2e/accesibilidad.spec.ts` (con `@axe-core/playwright`) recorre **nueve pantallas**
  —las cinco públicas, el portal del suscriptor y las cuatro del back-office— y sale
  **limpia**. Detalles con los que no conviene pelearse:
  (1) **Solo etiquetas de conformidad**: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`. Las
  *best-practice* de axe quedan fuera a propósito — mezclar consejos con criterios
  convierte el rojo en una opinión y deja de arreglarse.
  (2) **El informe se formatea a mano** (regla, impacto, `helpUrl` y selector): un
  `toEqual([])` a secas escupe el objeto entero de axe y hay que bucear para saber qué
  elemento falla.
  (3) **El back-office se audita con el admin** en una sola prueba con `test.step` por
  pantalla: entre roles cambian los datos visibles, no la composición de la página.
  (4) **Lo que esto cubre**: los fallos mecánicos, más o menos un tercio de los reales.
  Verde aquí no es "es accesible": el recorrido por teclado y si el texto alternativo
  describe algo siguen sin comprobarse. El contraste va aparte y en los dos temas
  (`tests/design-tokens.test.ts`).
  El inicio de sesión compartido salió de `circuito-completo.spec.ts` a **`e2e/sesion.ts`**
  (`login`, `apiLogin`, `PASSWORD`) para no duplicarlo.
- **El paralelismo del E2E lo limita la máquina: `workers: 3` (2026-08-19).** Con `axe`
  dentro, el defecto de Playwright (la mitad de los núcleos: 5–6) volvió a dar timeouts
  en `page.goto` —esta vez también contra el build autónomo, y hasta en el smoke—.
  **No es el mismo fallo que el de `next dev`**: no hay 500 ni pool caído, es hambre de
  CPU y memoria (cada worker es un Chromium entero y auditar con axe es caro en el
  navegador; 12 núcleos y ~7 GB libres con Docker y el servidor encima). Con **3
  workers, 21 pruebas en ~40 s**, verde repetido. Si aparecen timeouts sin sentido en
  navegaciones, baja `workers` antes de buscar la causa en la aplicación.
- **Wireframes — tercer entregable de UX (2026-08-20):** `documents/wireframes.md`, las
  cinco pantallas que faltaban: **W1** ficha de set `/catalogo/:id`, **W2** registro de
  condición, **W3** revisión de entrega + discrepancia, **W4** catálogo e inventario de
  back-office y **W5** portal ampliado. Wireframes ASCII de **disposición y contenido**;
  el estilo ya está resuelto en `design-system.md`. Cada pantalla lleva cuatro apartados
  fijos: datos, acciones con sus respuestas reales, vacío/error/espera y accesibilidad.
  **Método, otra vez el del cruce con el código.** Dibujar contra la forma real de los
  datos y los `detail` reales de la API es lo que produce información nueva; contra una
  idea de la pantalla no sale nada.
  **Decisiones que hay que respetar, no reinventar:**
  (1) **`/catalogo/:id` tiene una sola caja de decisión** que concentra todo lo que
  cambia entre visitante, suscriptor elegible y no elegible. El resto de la página es
  idéntico para todos porque es la proyección pública.
  (2) **Los cuatro motivos de no elegibilidad se muestran con su `detail` literal y una
  salida distinta cada uno** — es la razón de que `checkSetEligibility` devuelva 200 con
  el veredicto. Y **no elegible ≠ no encolable**: con `PLAN_LIMIT_REACHED` **sí** se
  puede entrar en la cola (`joinQueue` no mira el límite de plazas), así que se ofrecen
  las dos cosas.
  (3) **El botón de "Pedir este set" no se enseña cuando no hay copias**, aunque la API
  lo toleraría (devuelve 200 `no_copy_available`): la API es tolerante porque tiene que
  serlo, la pantalla es honesta con lo que sabe.
  (4) **No existe un botón "Todo correcto"** al revisar la entrega. La conformidad tácita
  no se persiste **a propósito** (`domain/rentals/delivery.ts`), así que ese botón no
  llamaría a nada. Solo hay "Algo no coincide", y el silencio se explica.
  (5) **`/portal/suscripcion` es pantalla propia** y **`/portal` se reparte en cinco
  rutas** con `layout.tsx` (cabecera, no `tabs`: son URL de verdad).
  (6) **El back-office de catálogo es lista + ficha, sin endpoint nuevo**: las pantallas
  son Server Components que leen el repositorio. No escribir `GET /api/sets` pensando que
  hace falta.
  (7) El aviso de downgrade se enseña **antes** de pulsar, calculando `canSwitchToPlan`
  al pintar; el 409 queda para la carrera. Pausar/cancelar mide `HELD_COPY_STATES` y el
  cambio de plan mide `OCCUPYING_COPY_STATES` — con una copia en inspección se puede
  pausar pero no bajar de plan, y el texto de cada bloque lo dice en sus términos.
  **Siete huecos que destapó dibujar (§8 del documento), dos bloqueantes:**
  (a) **`ALQUILADA` no está en `ACTIONABLE_STATES`** (`backoffice.repository.prisma.ts:17`),
  así que W2 sería inalcanzable: hace falta un grupo "Por preparar" en la cola de trabajo
  — y como registrar la condición **no cambia el estado de la copia** (crea el informe y
  el `Shipment` `OUTBOUND` `PREPARADO`), ese grupo debe excluir las que ya tengan envío
  de salida o lo preparado se queda en la cola para siempre.
  (b) **El `checklist` es `z.record(z.string(), z.unknown())` libre** en entrega e
  inspección: no hay catálogo de comprobaciones en ninguna capa. §4.3 propone cuatro
  ítems, **pendientes de ratificar**; deben ser los mismos para los dos informes o no
  serán comparables, que es lo único que justifica registrarlos.
  (c) La ventana de discrepancia reutiliza **`offerConfirmationWindowHours`**: acortar el
  plazo de las ofertas acorta sin querer el de reclamar una entrega.
  (d) **`QueueEntrySummary` no trae la posición** en la cola, así que HU-06 se queda a
  medias; se arregla en el repositorio, no en la pantalla.
  (e) **La navegación de superficie no está en los layouts.** Los layouts existen
  (`app/(portal)/portal/layout.tsx` y `app/(backoffice)/backoffice/layout.tsx`, con el
  guarda de superficie, el ancho, el usuario y el botón de salir), pero el `<nav>` del
  back-office vive dentro de `backoffice/page.tsx`: desde `/backoffice/clientes` hay que
  volver al centro para ir a otra sección. Hub y radios aguanta con tres secciones, no
  con las de W4 y W5.
  (f) No hace falta `GET /api/sets`. (g) La tabla de cobertura de `ux-flows.md` §7 estaba
  desfasada (se escribió un día antes de `plan-obligatorio-en-alta`); **corregida**.
  **Cobertura: hoy 9 de 18 historias con recorrido por interfaz; con las cinco
  construidas, 16 de 18 y 6 de 6 de las ⭐.** Orden de implementación (§9.2): W1 → los dos
  `layout.tsx` → W5 → W2+W3 (después de resolver (a) y (b)) → W4.
  **Documentos sincronizados:** `ux-flows.md` (§7, §8.2 cerrada entera, §9),
  `design-system.md` §6.2, `PRD.md` §9, `readme.md` §1.3 y árbol.
- **W1 construida — la ficha de set `/catalogo/:id` (2026-08-20).** Primera pantalla de
  los wireframes: `app/(public)/catalogo/[setId]/page.tsx` + `set-actions.tsx`, con
  `components/ui/card.tsx` traído de shadcn (sin sombra; `Card` y `CardTitle` con
  `asChild` porque el título no puede fijar nivel de encabezado). El catálogo deja de ser
  una rejilla sin destino: **HU-00, HU-03 y HU-04 pasan a verde** (12 de 18 historias con
  recorrido por interfaz; 5 de las 6 ⭐).
  **Cómo está resuelta, y por qué así:**
  (1) **Un solo `loadView`** devuelve un tipo discriminado (`public` | `authenticated`) en
  vez de repartir `if (session)` por la plantilla. La proyección la elige el llamante,
  igual que hace el Route Handler.
  (2) **Server Component**, no `fetch` desde el navegador: la página es pública y tiene
  que servirse renderizada para ser indexable — es la razón de ser de D13.
  (3) **A operador y admin no se les pide veredicto de elegibilidad** (`can(role,
  "rental.request")`): les diría "necesitas una suscripción activa", que es cierto e
  inútil. Ven la disponibilidad y una nota de que el alquiler es de suscriptores.
  (4) **La ventana de confirmación y las plazas del plan salen de sus fuentes**
  (`settings.load()`, `simultaneousSets()`), nunca escritas a mano.
  (5) **La caja de decisión es `<section aria-labelledby aria-live="polite">`**: el E2E se
  ancla por rol, y el cambio tras una acción se anuncia.
  (6) **Tarjeta del catálogo clicable con un solo enlace** (`after:absolute after:inset-0`
  sobre el nombre): tres enlaces al mismo destino serían tres paradas de tabulador.
  **Dos correcciones que salieron de construirla:**
  (a) **La cabecera pública ofrecía "Acceder" a quien ya tenía sesión.** No se notaba
  porque nadie visitaba las páginas públicas estando dentro; con la ficha, un suscriptor
  navega el catálogo desde dentro. Ahora enlaza a su superficie ("Mi portal" /
  "Back-office"). Una pantalla nueva no solo añade: cambia quién pisa las viejas.
  (b) "1 de 1 copias libres" estaba mal escrito; el texto pluraliza según el total.
  **Dos trampas de Playwright, anotadas porque volverán:**
  (i) **`getByRole("button", { name: "Salir" })` casa por subcadena** y en la ficha
  encontraba **"Salir de la cola"**: el paso que creía cerrar sesión sacaba a Bruno de la
  cola y deshacía el anterior. Ir al portal —donde vive el botón— antes de salir, o
  `exact: true`.
  (ii) **Esperar la navegación con `waitForURL`, no con un `expect` sobre el destino**: el
  `expect` corre contra 5 s y con tres workers la primera petición de una ruta recién
  estrenada los agota; el fallo miente ("no existe la región" cuando es "aún no ha
  llegado"). Este fue el fallo que solo salía contra el build autónomo y no contra
  `next dev`.
  **Un no-fallo:** "6785 piezas" sin separador es **correcto** en español — CLDR usa
  `minimumGroupingDigits: 2`, así que los números de cuatro cifras no se agrupan.
  **Verificación:** 344 unitarios, `tsc`, `eslint`, y **27 E2E en dos ejecuciones
  seguidas** dejando la base limpia (0 alquileres abiertos, 0 colas vivas). Los pasos 1 y
  2 del circuito completo **ahora pasan por la interfaz** en vez de por la API, que es
  donde se prueban HU-03 y HU-04 sin que dos ficheros se disputen la misma copia.
  `axe` audita ya **doce pantallas** (la ficha cuenta como dos: sus dos proyecciones).
  **Residuo:** una ejecución fallida dejó a Ana con una copia alquilada; se limpió **por
  la API** (devolución + transiciones), nunca con `copy.update({state})`.
- **Navegación de superficie (2026-08-20, paso 2 de `wireframes.md` §9.2):** los
  destinos de las dos superficies se declaran en **`lib/navigation.ts`** —lista por
  superficie, cada destino con el **permiso** que exige— y los pinta **`SurfaceNav`**
  (`components/surface-nav.tsx`) **desde el layout**, no desde la página. Antes la nav
  del back-office vivía dentro de `backoffice/page.tsx`: existía en el centro y no en
  las secciones, así que ir de `/backoffice/clientes` a `/backoffice/empleados` obligaba
  a volver al hub. **Tres decisiones que conviene no re-litigar:** (1) quién ve cada
  destino sale de la **matriz de permisos**, nunca de una comprobación de rol; (2) los
  destinos cuya pantalla aún no existe se declaran igualmente con `pending: true` y
  **no se pintan** —el orden de la barra es diseño, no orden de implementación— y quien
  construya W4 (`/backoffice/catalogo`) o W5 (las cuatro rutas del portal) solo tiene que
  **quitar la marca**; (3) el activo se marca con `aria-current="page"`, con prefijo para
  las secciones (la ficha de un cliente ilumina `Clientes`) y **coincidencia exacta para
  la raíz** de la superficie, o `/backoffice` saldría activa en las cinco. La barra **no
  se pinta con menos de dos destinos**, que es por lo que el portal aún no la enseña.
  Se quitaron los tres «← Volver a la cola de trabajo» de las secciones (redundantes con
  la barra); se mantiene el de la ficha de cliente → lista, que es un paso atrás, no una
  sección. `components/` y `lib/` son **presentación**: pueden importar de `src/domain`,
  y `src/` no los importa jamás.
  **Verificación:** 354 unitarios (`tests/navigation.test.ts` + `tests/surface-nav.test.tsx`
  nuevos), `tsc`, `eslint`, `next build` y **29 E2E en dos ejecuciones seguidas**
  (`e2e/navegacion.spec.ts` nuevo: el salto sección→sección y los destinos que el
  operador no ve). Sincronizados `wireframes.md` (§8.5 resuelta, §9.2), `design-system.md`
  §6.1/§6.2 (fuera la fila de `tabs`/`navigation-menu`: no hizo falta shadcn) y
  `readme.md` §1.3 + árbol.
  **Trampa de entorno, no de código:** con Docker Desktop recién arrancado, el E2E dio
  tres rojos en `page.goto` de páginas públicas intactas. Es el hambre de CPU documentada
  en `wireframes.md` §9.3, no una regresión: con el demonio ya estable, 29/29 en 20 s.
- **W4 hecha — catálogo e inventario del back-office (2026-08-20):**
  `/backoffice/catalogo` (lista) y `/backoffice/catalogo/:setId` (ficha) en
  `app/(backoffice)/backoffice/catalogo/`, **Server Components leyendo el repositorio**:
  no se escribió `GET /api/sets` y no hace falta (wireframes §2.1). **HU-10 en verde**;
  13 de 18 historias con recorrido por interfaz. Se construyó **fuera del orden de
  §9.2** (a petición del usuario): de las tres que quedaban era la única sin
  bloqueantes. Capa de datos nueva: `SetRepository.listManaged` (filtro + paginación +
  recuento de copias por set) y `listThemes`; `CopyRepository.listInventoryBySet` (copias
  con el **tenedor** del alquiler vivo); casos de uso `browseManagedCatalog` /
  `listThemeOptions` / `loadSetInventory`, todos con permiso `set.manage` — el mismo con
  el que la barra decide enseñar el destino, para que lista, ficha y navegación no se
  abran por puertas distintas.
  **Hallazgo importante (arreglado):** el botón `[ Dar de baja ]` iba por el endpoint
  **genérico** de transiciones con el motivo enlatado `"Acción desde la cola de
  trabajo"`, saltándose que `POST /api/copies/:id/retire` **exige motivo**. Ahora la
  baja abre un diálogo, pide el motivo y va a `/retire`, en el **componente compartido**
  `components/backoffice/copy-actions.tsx` (antes `work-queue-actions.tsx`), así que lo
  arregla también la cola de trabajo. Sus botones nombran su copia
  (`aria-label="Catalogar: copia AB12"`).
  **Defecto viejo destapado y corregido:** el layout raíz añade `· Clickoteca` con
  `title.template` y **siete páginas lo repetían** en su `metadata` → "Cola de trabajo ·
  Clickoteca · Clickoteca". La ficha de catálogo usa `generateMetadata` con el nombre del
  set.
  **Decisiones de componentes:** se trajeron de shadcn `dialog`, `input` y `label`
  (reescritos al estilo de la casa: `var(--token)`, sin `dark:`); **no** `select` (el
  tema es un `<select>` nativo: veinte opciones planas, mejor en móvil, sin JS), **no**
  `alert-dialog` (la baja pide un dato, y `alertdialog` es para decidir) y **no** `table`
  (habría dejado dos estilos de tabla en el back-office).
  **Trampa de Playwright, anotada porque volverá:** `getByRole("alert")` casa también con
  el **anunciador de rutas de Next** (`#__next-route-announcer__`), así que en cuanto hay
  un error en pantalla la consulta es ambigua y salta *strict mode*. Anclar por texto.
  **Y una lección de datos:** la semilla es idempotente **por existencia**, así que no
  restaura estados — tras varias ejecuciones del E2E todas las copias acabaron
  `DISPONIBLE` y ya no había ninguna `INCOMPLETA` con la que probar la baja. Por eso la
  baja se prueba en `tests/copy-actions.test.tsx` (componente, con `fetch` simulado) y no
  en el E2E. El E2E de W4 deja **un set de prueba sin publicar por ejecución**: el dominio
  no contempla borrar un Set y la prueba no lo salta por detrás.
  **Verificación:** 366 unitarios, `tsc`, `eslint`, `next build` y **33 E2E en dos
  ejecuciones seguidas**; `axe` audita ya catorce pantallas más el diálogo de alta.
- **W5 hecha — portal ampliado (2026-08-20):** las cinco rutas de `wireframes.md` §7
  (`/portal`, `/portal/sets`, `/portal/historial`, `/portal/suscripcion`,
  `/portal/avisos`) con la barra del layout encendida y el **contador de avisos sin
  leer** (`NotificationRepository.countUnread`, nuevo). **HU-09 en verde** —pausar,
  cancelar y reactivar tenían API y ningún botón—; **14 de 18** historias con recorrido
  por interfaz. Piezas: `subscription-actions.tsx` (PlanSwitcher con el aviso de
  downgrade **precalculado en el servidor**, pausar/reactivar y cancelar con
  `AlertDialog`), `avisos/notification-actions.tsx`, y `components/ui/alert-dialog.tsx`
  **escrito a mano** sobre Radix porque el generador de shadcn insistía en sobrescribir
  `button.tsx` (`npx shadcn add` es interactivo y se cuelga en entorno no interactivo).
  **Decisiones:** (1) **las colas viven en "Mis sets"** — §2.3 fija cinco destinos y no
  hay sexta ruta; (2) los dos veredictos (`canSwitchToPlan`, `canEndSubscription`) se
  calculan **al pintar**, así que el 409 queda para la carrera; (3) `pending` en
  `lib/navigation.ts` **se retiró**: ya no queda ningún destino sin pantalla.
  **Hallazgo de producto abierto:** **cancelar es un callejón sin salida** —
  `findCurrentSubscription` ignora las canceladas (correcto) y `register` exige email
  nuevo, así que no hay forma de recontratar desde la web. Falta un "recontratar" que
  reabra suscripción a un usuario existente.
  **Dos textos corregidos:** cancelar **no** saca de las colas (las entradas siguen y el
  recorrido las salta por no elegible, D5), y el precio se pintaba con el decimal crudo
  ("24.99 €/mes") porque viaja como cadena.
  **Trampa de axe, anotada porque volverá:** medía el contraste **mientras el diálogo
  entraba** —opacidad a medias, color mezclado con lo de debajo— y daba falsos fallos.
  `auditar()` espera ahora a `document.getAnimations()` en reposo.
  **E2E:** `e2e/portal.spec.ts` crea **su propia cuenta** por ejecución (helper
  `registrarSuscriptora` en `e2e/sesion.ts`): pausar o cancelar cambia el estado del
  suscriptor entero y chocaría con el circuito completo, que corre en paralelo. El
  circuito hubo que adaptarlo: la devolución ya no está en el resumen sino en
  `/portal/sets`.
  **Limpieza de residuo:** dos ejecuciones fallidas dejaron a Ana con dos sets y a Bruno
  en una cola; se limpió **por el dominio** (script `tsx --env-file=.env` llamando a
  `leaveQueue`, `startReturn` y `advanceCopyLifecycle`), nunca tocando `copy.state`.
  **Verificación:** 367 unitarios, `tsc`, `eslint`, `next build` y **36 E2E en dos
  ejecuciones seguidas** dejando la base limpia (0 alquileres abiertos, 0 colas vivas);
  `axe` audita 18 pantallas y 2 diálogos.
- **Los dos bloqueantes de W2/W3, resueltos (2026-08-20):**
  **§8.1 — la puerta que faltaba.** La cola de trabajo incluye ahora las copias
  `ALQUILADA` **sin envío de salida** (`PENDING_DISPATCH` en
  `backoffice.repository.prisma.ts`), como grupo **primero** y titulado **"Por
  preparar"**. El matiz que hay que no olvidar: registrar la condición **no mueve la
  copia** —crea el informe y el `Shipment` `OUTBOUND`, pero sigue en `ALQUILADA`—, así
  que sin excluir las que ya tienen envío, lo preparado se quedaría en la cola para
  siempre. Como en la cola esa copia **no está "con el cliente"**, `lib/status.ts` gana
  **`workQueueGroup()`**: el mismo estado leído como trabajo pendiente (warning), sin
  tocar la etiqueta que usa la ficha de catálogo. Falta solo su botón, que llega con W2.
  **§8.2 — lista de comprobación ratificada por el usuario: DOS ítems**, `pieceCount`
  (recuento de piezas) y `manual`. Fuera la caja —para un set de construcción el
  embalaje casi no es valor y para uno de exposición sí— y las piezas sueltas, que se
  ven en el recuento. Viven en **`src/domain/rentals/condition-checklist.ts`** y de ahí
  se deriva **`src/http/condition-checklist-schema.ts`**, que validan los **dos**
  endpoints: o están todas o ninguna, nada fuera del catálogo, y booleanos. El tipo
  `ConditionChecklist` sustituye al `Record<string, unknown>` en el puerto y en los casos
  de uso. **Añadir un ítem es tocar un fichero**; quitarlo, ojo: los informes guardados
  lo seguirán trayendo.
- **Volver a suscribirse tras cancelar (2026-08-20, a petición del usuario):** el alta
  con un email que **ya existe** reabre la suscripción **si viene con la contraseña de
  esa cuenta** (`registerSubscriber` → `resubscribeExisting`, puerto
  `SubscriberRepository.resubscribe`). Cierra el callejón sin salida que destapó W5.
  **Decisiones:** (1) sin la contraseña correcta la respuesta es **la misma de antes**,
  así que no se revela nada nuevo — pero **sí añade un sitio donde probar contraseñas**,
  igual que el login: cuando haya limitación de intentos tiene que cubrir los dos;
  (2) cuenta del equipo y cuenta suspendida se distinguen **solo tras acreditar la
  identidad**, mismo criterio que `login.ts`; (3) la comprobación de "no tiene otra
  vigente" va **dentro de la transacción** del repositorio, o dos altas simultáneas
  dejarían dos suscripciones; (4) se actualizan nombre, dirección y tarjeta con los
  datos nuevos, y las anteriores dejan de ser las de por defecto **sin borrarse**
  (pueden estar referenciadas por pagos y por el snapshot de un alquiler). Spec nueva en
  `openspec/specs/accounts-roles` ("Volver a suscribirse con una cuenta existente").
  **Verificación:** 382 unitarios, `tsc`, `eslint`, `next build` y **38 E2E en dos
  ejecuciones seguidas** (`e2e/preparacion.spec.ts` nuevo, que cierra su circuito).
- **W2 + W3 hechas — las dos últimas pantallas (2026-08-20):**
  `/backoffice/copias/:copyId/entrega` (registro de condición, HU-11) y la **franja de
  revisión + diálogo de discrepancia** dentro de `/portal/sets` (HU-07). Con ellas,
  **las cinco pantallas de los wireframes están construidas**: 16 de 18 historias con
  recorrido por interfaz y **las seis ⭐ del producto**.
  **Cambio de modelo:** `ConditionReport.notes` (migración `condition-report-notes`). El
  wireframe pedía "Observaciones (opcional)" y el modelo no tenía dónde guardarlas; sin
  esa válvula un informe `Dañada` no puede decir **qué** está roto, y la asimetría era
  indefendible — el suscriptor sí podía escribir su versión (`Incident.notes`).
  **Invariante nuevo:** un alquiler tiene **un solo** registro de entrega
  (`recordDeliveryCondition` lo comprueba). El segundo crearía otro envío de salida y
  movería el reloj de la discrepancia; la cola ya excluía lo preparado, pero la pantalla
  no es la única puerta al endpoint.
  **`ConditionReportSummary` sale ahora con `checklist` y `notes`**: el diálogo de W3
  necesita enseñar **contra qué se compara** lo recibido. Se pintan en el orden del
  catálogo, no en el del JSON, y las casillas de informes antiguos que ya no estén en el
  catálogo van al final (son historia y no se reescriben).
  **La URL de W2 va por copia** —es lo que el operador tiene en la mano y lo que enseña
  la cola— y el alquiler se resuelve con `findLatestByCopy`; el nombre del suscriptor
  sale de `backoffice.findCustomer`, porque `RentalSummary` solo trae `userId`.
  **Tres trampas del E2E, ya con reincidencia:** (1) **anclar por la fila del set no
  vale** — dos pruebas en paralelo pueden tener dos copias del mismo set; se ancla por
  el enlace de la copia (`enlaceDeEntrega` en `e2e/alquileres.ts`); (2) la limpieza del
  circuito va en un **`finally`** y es "haz lo que puedas", porque una prueba que falla a
  mitad dejaba la copia alquilada y el residuo se paga al día siguiente; (3) el montaje
  común (alquilar / cerrar circuito / buscar un set con copias de sobra) vive en
  `e2e/alquileres.ts`, no copiado en cada spec.
  **Verificación:** 385 unitarios, `tsc`, `eslint`, `next build` y **41 E2E en dos
  ejecuciones seguidas** dejando la base limpia; `axe` audita 19 pantallas y 3 diálogos.
- **HU-06 y HU-16, las dos que faltaban (2026-08-21):** con ellas, **18 de 18 historias
  con recorrido por interfaz** y ninguna que dependa ya de llamar a la API a mano.
  **§8.4 — el puesto en la cola llega al portal.** `listEntriesForUser` devuelve
  `QueueEntryPlacement` (la entrada + `position` + `queueLength`) y "Mis colas" abre cada
  línea con **"2.º de 5"**. Tres decisiones: (1) el puesto lo calcula el **dominio**
  —`placeInQueues` en `reservation-queue/ordering.ts`, que agrupa por Set y ordena con el
  mismo `orderQueue` que sirve las ofertas—, no una cuenta aparte en SQL, o el criterio de
  D11 quedaría escrito en dos sitios y la pantalla acabaría diciendo un puesto que el motor
  no respeta; **el doble en memoria usa la misma función**, por lo mismo; (2) es una
  **proyección aparte** y no dos campos en `QueueEntrySummary`, porque el puesto obliga a
  leer la cola entera del Set y quien crea una entrada no debe pagar esa consulta; (3) **una
  segunda consulta, no N**: se piden de golpe las entradas vivas de todos los Sets del
  usuario. Spec nueva en `reservation-queue` ("Consulta de la posición en cola"), con el
  escenario de que **el puesto no revela quién más espera**.
  **HU-16 — la sexta pantalla, sin wireframe previo** (`wireframes.md` §10). Los **planes**
  se editan en `/backoffice/configuracion`: un formulario por plan y **un solo botón**, los
  tres campos en la misma llamada a `PATCH /api/plans/:code`, para que subir el precio y
  bajar el bono sea un cambio y no dos en la auditoría. Los **recordatorios de retención**
  van en la **ficha del set** (`/backoffice/catalogo/:id`) y no en el panel: el endpoint es
  por set y llevarlo a configuración obligaría a inventar allí un selector; en el panel
  queda un puntero al catálogo y la cadencia por defecto. La pantalla dice lo que más
  sorprende de D7: activar los recordatorios de un set **que nadie espera no envía nada**.
  Al operador se le enseñan igual las dos —se explica el 403, no se esconde la acción—.
  **Mando inerte retirado:** `premiumQueueBonusDays` era un ajuste del sistema que **no
  leía nadie** (el encolado congela `Plan.queueBonus`); fuera del catálogo y de la semilla.
  Las filas que sigan en la base son inofensivas: `resolveSettings` solo recorre las claves
  del catálogo. **§8.3 cerrado por la vía barata:** el campo de la ventana de confirmación
  lleva debajo que es **también** el plazo para reclamar una entrega. Separarlo en dos
  ajustes sigue siendo un cambio de modelo que nadie ha pedido.
  **Puerto nuevo:** `QueueRepository.countActiveEntriesForSet` (WAITING|OFFERED, el mismo
  criterio que el `queueLength` de los recordatorios).
  **Carrera vieja destapada y corregida en `circuito-completo.spec.ts`:** tras pulsar
  **"Higienizada"** la prueba cerraba sesión sin esperar nada, y el `fetch` en vuelo se
  abortaba al navegar: la copia se quedaba en `EN_HIGIENIZACION`, la oferta a Bruno no
  llegaba a existir y **el fallo aparecía tres pasos más allá**, en un "Te toca" que
  nadie había pedido. Los dos pasos anteriores no lo sufrían porque se anclan en el
  encabezado del grupo siguiente; este no tiene grupo detrás —la copia **sale** de la
  cola de trabajo—, así que ahora se ancla en `waitForResponse` de la transición. La
  regla, para no repetirla: **una acción que quita la fila de la pantalla no tiene dónde
  anclarse en la pantalla**.
  **Verificación:** 397 unitarios (`tests/configuracion-forms.test.tsx` nuevo, con los dos
  formularios y sus caminos de error), `tsc`, `eslint`, `next build`,
  `openspec validate --strict` y **44 E2E en dos ejecuciones seguidas** dejando la base
  limpia (0 alquileres abiertos, 0 colas vivas). Las tres pruebas nuevas están escritas
  para no dejar residuo: `e2e/configuracion.spec.ts` **no cambia ningún valor** —guarda el
  plan con los que ya tiene, porque precio y bono son globales y otra prueba en paralelo
  comprueba el precio en el alta—; el paso de retención va dentro de
  `catalogo-backoffice.spec.ts`, sobre **su** set de prueba, que no tiene alquileres; y la
  comprobación del puesto en `circuito-completo.spec.ts` es **por forma**
  (`/^\d+\.º de \d+$/`) **y no por número**, porque otra prueba puede encolarse en el
  mismo set.
- **El build genera el cliente Prisma (2026-08-21):** `"build": "prisma generate && next
  build"`. `src/generated/prisma` está en `.gitignore` —se regenera— así que en cualquier
  máquina limpia (Vercel, un CI, un clon recién hecho) el módulo no existía y fallaban de
  golpe el route handler, el `proxy` y el Server Component que acaban importándolo. **Ojo:
  `prisma generate` carga `prisma.config.ts`, que resuelve `DATABASE_URL` al arrancar**;
  sin esa variable el build muere ahí, no más tarde.
- **Los trabajos periódicos se disparan también por HTTP (2026-08-21):**
  `GET /api/cron/:job`, para destinos sin proceso de vida larga —el intento de despliegue
  en Vercel—. Lo que hay que no olvidar: el **qué** vive en
  `src/use-cases/scheduler/jobs.ts` y lo comparten `scheduler/index.ts` y el endpoint;
  los dos disparadores solo aportan el reloj. Añadir un trabajo es tocar el catálogo
  `JOBS`, y el nombre de la ruta sale de ahí (uno que no esté es 404).
  **Candado:** `Authorization: Bearer $CRON_SECRET` —el contrato que ya emite Vercel Cron
  y que un `systemd timer` replica—, comparado con `timingSafeEqual` y **cerrado por
  defecto**: sin `CRON_SECRET` responde **404** (no 503: sin secreto aquí no hay endpoint,
  y así tampoco confirma qué trabajos existen). **No hay guardarraíl contra el solape** —el
  flag en memoria del scheduler no sirve cuando cada invocación es un proceso distinto—:
  lo sostiene el CAS del cierre de oferta, con el margen conocido de que dos barridos a la
  vez repitan **un recordatorio**. `vercel.json` declara los dos crons; **el cron de Vercel
  va en UTC** (10:00 Madrid = 08:00 UTC en verano, 09:00 en invierno) y el **plan Hobby**
  —el de esta cuenta— admite dos crons y **solo diarios**: una expresión más frecuente
  **hace fallar el despliegue**, no lo degrada, y además los dispara en cualquier momento
  dentro de la hora. Por eso `vercel.json` los tiene **diarios** y no `*/5`. El precio,
  anotado para no redescubrirlo: la caducidad de ofertas se vuelve imprecisa —una ventana
  de 48 h puede cerrarse casi un día tarde—. Se recupera con plan de pago o disparando el
  endpoint desde fuera.
  Verificado a mano contra el paquete autónomo: 401 sin credencial y con la equivocada,
  404 sin `CRON_SECRET` y con un trabajo inventado, 200 con resumen contable en los dos
  trabajos buenos.
- **Supabase por Vercel: las variables no encajan solas (2026-08-21):** la integración
  crea `STORAGE_POSTGRES_PRISMA_URL` (pooler 6543, `sslmode=require&pgbouncer=true`),
  `STORAGE_POSTGRES_URL_NON_POOLING` (5432, sesión estable) y un montón de claves del
  cliente JS de Supabase que **aquí no usa nadie** —solo se usa como Postgres, ni Auth ni
  Storage ni RLS—. `DATABASE_URL` se crea a mano copiando el valor de la primera, y
  `DIRECT_URL` **solo en el `.env` local** con la segunda: quien migra es la máquina de
  desarrollo, no Vercel. **Decisión: el código no lee las `STORAGE_*`** —acoplaría el
  proyecto a los nombres de una integración de Vercel, y el mismo código tiene que
  arrancar en la VM y en local—.
- **`output: "standalone"` y Vercel son incompatibles (2026-08-21):** el modo standalone
  se lleva el trazado a `.next/standalone/` y **deja de emitir
  `.next/next-server.js.nft.json`**, que es justo el fichero que abre el paso
  `onBuildComplete` de Vercel. El build compila entero, genera las 28 páginas y muere al
  final con un **`ENOENT` sobre ese json** que no menciona "standalone" por ningún lado —
  y `Applying modifyConfig from Vercel` en el log despista, porque parece que Vercel ya
  ajusta la config. `next.config.ts` decide ahora por `process.env.VERCEL`: en la VM, en
  local y en el E2E sigue saliendo el paquete autónomo. Comprobado en las dos
  direcciones, y `tests/next-config.test.ts` lo fija.
- **TLS con Supabase: `uselibpqcompat=true` (2026-08-21):** `pg` v8.16+ trata
  `sslmode=require` como `verify-full` y el certificado del pooler de Supabase encadena a
  una raíz que Node no lleva → *"self-signed certificate in certificate chain"*. **No se
  ve al migrar** —el motor de Prisma usa semántica libpq— sino en la **aplicación**, que
  va por el mismo `pg` del driver adapter, así que el síntoma aparece en el primer query
  y no en el despliegue. El parámetro devuelve a `require` su significado de libpq y es
  la forma que sobrevive al cambio anunciado para `pg` v9. Alternativa estricta: la CA de
  Supabase con `verify-full` y `sslrootcert`.
- **`vercel env pull` no baja los secretos de una integración (2026-08-21):** las
  variables que gestiona la integración de Supabase se descargan con el valor literal
  `[SENSITIVE]`. Solo bajan con valor real las creadas a mano. Consecuencia práctica:
  comparar dos de esas variables entre sí **no prueba nada** —y la forma fiable de saber
  si una credencial sigue siendo válida es **intentar conectar**, no compararla—. La URL
  de sesión (5432) se puede **derivar** de la del pooler (6543) cambiando puerto y
  quitando `pgbouncer`: mismo host, usuario y contraseña.
- **La base de Supabase quedó inicializada (2026-08-21):** `migrate deploy` de las cinco
  migraciones + semilla con `SEED_PASSWORD`. 23 tablas, 2 planes, 35 sets, 59 copias,
  5 ajustes y las 5 cuentas. **Data API de Supabase desactivada** —el proyecto usa
  Supabase solo como Postgres— porque las tablas creadas por Prisma nacen **sin RLS** y
  quedarían legibles con la anon key, que es pública por diseño.
- **Vercel no es la arquitectura del ADR (2026-08-21, en curso):** el intento de
  despliegue destapa tres cosas que el ADR-0001 §5 daba por resueltas con la VM y allí no
  lo están — no hay Postgres en `localhost` (hace falta uno gestionado, su `DATABASE_URL`,
  `prisma migrate deploy` y la semilla), no hay proceso para el scheduler (resuelto con el
  endpoint de cron) y `@node-rs/argon2` es un binario nativo que puede fallar en runtime,
  no en build. Lo que **no** es problema: no se escribe en disco —las imágenes son URLs de
  Rebrickable— y `proxy.ts` corre en runtime Node en Next 16, así que Prisma en el
  middleware funciona.
- **Postgres gestionado = dos URLs (2026-08-21):** con un pooler de transacciones
  delante (Supabase, Neon) la aplicación va al pooler y **las migraciones no pueden** —
  necesitan sesión estable para el *advisory lock* y el DDL—. `prisma.config.ts` usa
  ahora `DIRECT_URL` si existe y `DATABASE_URL` si no, con `process.env` para la primera
  porque `env()` lanza cuando falta y aquí faltar es lo normal. Se añade
  `DATABASE_POOL_MAX` (por defecto, el de `pg`): en serverless hay **un pool por
  instancia viva** y diez conexiones cada uno agotan el límite del proveedor; en la VM,
  un solo proceso quiere el pool holgado, así que no se fija un número a ciegas. Script
  nuevo `db:deploy` (`prisma migrate deploy`) — `db:migrate` es `migrate dev` y contra
  una base remota no se usa. **Lo que no hay que tocar para desplegar fuera de la VM:**
  el esquema, las imágenes (son `<img>` a URLs de Rebrickable, no `next/image`), la
  cookie (`Secure` sale de `NODE_ENV`) y el `proxy`. **Y un dato descubierto mirando:**
  `SESSION_SECRET` y `APP_URL` del `.env.example` **no los lee nadie** — el token de
  sesión es aleatorio y se guarda hasheado (ADR-0002 §1).
- **Un solo repositorio, y es el del curso (decidido 2026-08-21):** al conectar Vercel,
  este creó `xaviverges/clickoteca` — que **no es un fork**: un único commit "Initial
  commit", **sin ancestro común** (`git merge-base` vacío) y con el árbol exacto de
  `d169b2d`, o sea el estado anterior a los tres commits que arreglan el despliegue. De
  ahí que el build siguiera fallando allí. Dos repos sin ancestro común no se pueden
  sincronizar sin *force-push*, y la historia del entregable —la que nombra `readme.md`
  §0.5, con el log de prompts y los ADR— es justo lo que se corrige, así que se descarta
  desplegar desde un repo cuyo único commit se llama "Initial commit". **Vercel apunta a
  `AI4Devs-finalproject-xvm`**, y `clickoteca` se archiva. **Ojo con la rama:** Vercel
  despliega *Production* desde la rama de producción del repo, que por defecto es `main`
  —aquí, el andamiaje del curso—, así que hay que fijar **Production Branch =
  `MVP-Fase-1`**.
- _(More facts to be added as the project develops.)_

## Open questions

- **Estado general.** Arquitectura, hosting, auth, UI, tests y versión de Prisma
  cerrados; **bloque 1 (Fundaciones) completo**: scaffolding (1.1), modelo de datos y
  primera migración (1.2) y semillas (1.3), todo verificado. Bloque 2 en curso: 2.1
  2.1 (autenticación), 2.2 (matriz de permisos), 2.3 (baja de copia solo admin) y 2.4
  (auditoría), 2.5 (alta de suscriptor), 2.6 (visitante) y 2.7 (tests) hechas —
  **MVP completo: las 45 tareas de `clickoteca-mvp` hechas y verificadas**
  (hoy **385 tests unitarios + 41 E2E**, `openspec validate --strict` en verde). Lo que queda
  fuera del MVP: **diseño visual y UX** —los **tres entregables de diseño están hechos**:
  flujos por rol (`documents/ux-flows.md`), sistema de diseño
  (`documents/design-system.md`) y **wireframes** (`documents/wireframes.md`, 2026-08-20);
  **las cinco pantallas están construidas** (W1 ficha de set, W2 registro de
  condición, W3 discrepancia, W4 catálogo e inventario, W5 portal ampliado) más la
  **navegación de superficie**— y el despliegue en la VM. **`axe` ya está en el
  E2E.** La decisión de alcance sobre el plan y el alquiler puntual está **tomada,
  ejecutada y archivada** (cambio `plan-obligatorio-en-alta`, 2026-08-17). **`ux-flows.md`
  §8.2 ya no tiene nada abierto**: los wireframes cerraron los tres puntos que quedaban.
  Los dos bloqueantes de `wireframes.md` §8.1 y §8.2 están **resueltos**
  (2026-08-20): la cola de trabajo tiene el grupo "Por preparar" y la lista de
  comprobación está ratificada en el dominio. **§8.4 y §8.7 cerrados el 2026-08-21**
  (posición en cola y pantalla de HU-16) y **§8.3 anotado**: de los siete hallazgos de
  §8 no queda ninguno abierto, y la cobertura es **18 de 18 historias**. Lo único
  pendiente del proyecto es el **despliegue en la VM** y el **videotutorial**. Para cualquier cambio de estado de una copia, usar
  `advanceCopyLifecycle` / `transitionCopy`; nunca `copy.update({state})`.

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
