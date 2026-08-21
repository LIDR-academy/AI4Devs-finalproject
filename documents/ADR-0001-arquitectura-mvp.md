# ADR-0001 — Arquitectura de la aplicación (Clickoteca MVP)

- **Estado:** Aceptado. Hosting **confirmado** (VM única Oracle free, §5) y
  framework **confirmado**: **Next.js full-stack** (App Router) para front + API
  (decidido 2026-07-05); no quedan *Open questions* de arquitectura.
- **Fecha:** 2026-07-04 (rev. 2026-07-05: framework Next.js)
- **Decisores:** Xavier Vergés (owner).
- **Contexto de origen:** `openspec/changes/clickoteca-mvp/` (proposal + design +
  specs), `documents/PRD.md`, `documents/C4-architecture.md`, `prompts.md`.

> Este ADR registra las decisiones **de arquitectura de la aplicación** (stack,
> estructura, despliegue). Las decisiones **de dominio** (Set vs Copia, ciclo de
> vida, orden de cola, etc.) están en `design.md` D1–D13 y no se repiten aquí.

---

## Contexto

Clickoteca es el proyecto final de AI4Devs/Lidr: una biblioteca de sets de Lego
por suscripción. El objetivo es demostrar el **circuito E2E completo** desde las
dos caras (suscriptor y back-office), con pagos y logística **simulados**
(*non-goals*). Es greenfield: `main` solo tenía scaffolding de documentación.

Restricciones y fuerzas que condicionan la arquitectura:

- **Académico, no escala a producción.** Prioridad: circuito demostrable,
  modelo de dominio correcto y **cobertura de tests de caminos de error**, no
  KPIs ni alta disponibilidad (PRD §10).
- **Dominio rico en estado y transiciones.** Máquina de estados de la copia
  (9 estados) y cola con equidad; el modelo debe ser correcto desde el día uno.
- **Coste ≈ 0.** Se busca free tier en todo el hosting.
- **Accesibilidad objetivo WCAG 2.1 AA** (EN 301 549 / European Accessibility
  Act) y responsive mobile-first.
- **Procesos temporales de primera clase:** caducidad de ventanas de oferta y
  recordatorios requieren ejecución periódica y por evento (`design.md` D5, D7).
  El orden de cola **no** los necesita (invariante en el tiempo, D11).

---

## Decisión

Adoptar una **aplicación Next.js full-stack** (App Router, TypeScript) que sirve
tanto el frontend (SSR/RSC) como la **API REST pública** (Route Handlers en
`app/api/*`, documentada en OpenAPI), sobre **PostgreSQL + Prisma**, más un
**scheduler** en proceso aparte para los procesos temporales. En la VM (§5) hay,
por tanto, **dos procesos Node** (app Next + scheduler) y **PostgreSQL** local.
Elecciones concretas:

### 1. Capa de datos: PostgreSQL + Prisma
Base relacional por la naturaleza fuertemente transaccional y relacional del
dominio (colas, ofertas, transiciones auditadas). Prisma como ORM por su
tipado end-to-end en TypeScript, migraciones y velocidad de desarrollo.
El esquema (22 modelos, 18 enums) vive en `prisma/schema.prisma`.

> **Nota de versión:** el esquema usa `url = env("DATABASE_URL")`, válido en
> Prisma ≤6. Prisma 7 lo mueve a `prisma.config.ts`. **Pinnear Prisma 6** en el
> `package.json` del backend, o migrar la config del datasource.

### 2. Framework: Next.js full-stack (App Router, TypeScript)
Un **único proyecto Next.js** (App Router) cubre front y back:
- **Frontend**: rutas SSR/RSC responsive (mobile-first, WCAG 2.1 AA). El
  **Back-office** se segmenta por rol con **route groups + middleware de auth**
  (p. ej. `app/(portal)/…` y `app/(backoffice)/…`); el *code-splitting* por ruta
  lo da Next de serie, así que el código de back-office no viaja al navegador del
  suscriptor sin autorización.
- **API REST pública**: **Route Handlers** en `app/api/*`, **documentados en
  OpenAPI**. Validación de entrada con **Zod**, que además alimenta el spec
  (`zod-to-openapi` / equivalente). REST + OpenAPI se mantiene como contrato
  estándar, testeable y autodocumentado (era requisito, `readme.md` §4).

**Por qué Next.js.** Unifica front y API en un solo proyecto y un solo *deploy*,
lo que encaja con el hosting **mismo-origen** de §5 (sin CORS, cookie
*first-party*) mejor que un split SPA + API separada. App Router (no Pages
Router) por ser el modelo actual y soportar RSC/streaming.

### 3. Arquitectura en capas (dominio agnóstico del framework)
Los Route Handlers son **finos** y delegan en `casos de uso → repositorios →
dominio` (Prisma), aplicando SOLID/CUPID/DRY **sin DI pesado**. El dominio
(máquina de estados, política de cola) **no conoce Next**: es un módulo TS puro,
testable sin levantar el servidor. Los Server Components/Actions consumen esos
mismos casos de uso o la API REST según convenga, pero la lógica de negocio vive
en una sola capa reutilizable — no en los componentes ni en los handlers.

Condición de diseño: la **capa compartida** (cliente del contrato OpenAPI, tipos,
modelos de dominio, tokens de diseño) se factoriza como módulo reutilizable, de
modo que una futura extracción de la API a un servicio aparte sea barata.

### 4. Procesos programados (scheduler)
**Caducidad de ventanas de oferta** (`design.md` D5) y **recordatorios** (D7) se
implementan como procesos programados que **reutilizan los casos de uso** del
dominio. El **orden de cola ya no requiere recálculo**: se ordena de forma *lazy*
sobre `entrada_efectiva` inmutable (D11 revisado), así que el scheduler solo cubre
esos dos eventos temporales. Corre como **proceso Node separado** (`node-cron`) en
la misma VM (§5) — **no** in-process en el servidor Next: el modelo de Next
(orientado a *serverless*/multi-instancia) haría que un cron in-process se
**duplicara** por instancia. Un proceso dedicado que importa la misma capa de
casos de uso lo evita y es reversible (alternativa: *systemd timer* que invoca un
endpoint interno).

> **Añadido el 2026-08-21.** Esa alternativa ya existe, y por una razón que el ADR no
> había previsto: un despliegue **serverless** no puede tener un proceso de vida larga,
> así que ahí el scheduler no es reversible sino imposible. `GET /api/cron/:job`
> dispara los mismos trabajos por HTTP, con `Authorization: Bearer $CRON_SECRET` y
> **cerrado por defecto** —sin la variable responde 404 y no ejecuta nada—. Lo que
> importa de la forma: el **qué** vive en `src/use-cases/scheduler/jobs.ts` y lo
> comparten los dos disparadores; el proceso `node-cron` y el cron de la plataforma
> solo aportan el reloj. Sin ese módulo común, la primera divergencia entre los dos
> caminos sería cuestión de semanas y solo se notaría en producción.
>
> Lo que **no** aporta el endpoint: el guardarraíl contra el solape. El scheduler tiene
> un flag en memoria y ahí no sirve, porque cada invocación es un proceso distinto. Lo
> sostiene el dominio (el cierre de oferta es un CAS), con el margen conocido de que
> dos barridos simultáneos podrían repetir **un recordatorio**.

### 5. Hosting: VM única con IP pública (Oracle Cloud Free Tier)
Un **único servidor Linux** aloja todo el sistema. Un **reverse proxy** (Caddy)
termina TLS y enruta el tráfico al **servidor Next.js** (que sirve el front y la
API en `/api`); el **scheduler** corre como proceso Node aparte; **PostgreSQL**
corre **local** (escuchando solo en `localhost`); las **imágenes** del catálogo se
guardan en el **filesystem** del host y se sirven como estáticos. Despliegue con
`next build` (output *standalone*) + `next start` gestionado por systemd.

- **Proveedor:** Oracle Cloud **Free Tier**, instancia **Ampere A1 (ARM64 /
  aarch64)**, *always-free*.
- **Specs:** **2 OCPU · 12 GB RAM · 50 GB** de Block Volume · **Ubuntu 24.04 LTS**
  (holgadamente dentro del envelope *always-free*: 4 OCPU / 24 GB / 200 GB). Con
  este dimensionamiento el pico de *build* en la propia VM no da OOM.
- **Arquitectura ARM64:** todos los componentes son arm64-nativos (Node/Next,
  PostgreSQL, Caddy) — sin fricción. Los 12 GB de RAM absorben el pico de
  `next build` en la propia VM.
- **TLS:** Caddy con Let's Encrypt automático (necesario para la cookie `Secure`,
  ver `ADR-0002`).
- **Firewall:** exponer solo 80/443 (y 22 para administración); **Postgres nunca en
  la IP pública**.
- **Backups:** `pg_dump` por cron (ya no hay backups gestionados de un PaaS).

**Por qué esta opción.** Al residir la app Next (front + API), imágenes y BD en el
**mismo origen**:
- **Desaparece CORS** y se simplifica la auth: la cookie de sesión es *first-party*
  (`SameSite=Lax/Strict`), sin la complejidad cross-origin (`ADR-0002`).
- **Desaparecen** el *cold-start* (Render) y la **suspensión** de BD (Neon): la
  latencia es local y constante.
- El almacenamiento de imágenes **no necesita un servicio aparte**.
- Coste **0 €** permanente (*always-free*).

**Trade-off:** se pasa de PaaS gestionado a **ops propio** (TLS, parches de SO,
firewall, backups) y a un **punto único de fallo** — aceptable en un MVP de demo.
Riesgo específico de Oracle: la instancia *free* puede ser **reclamada** si queda
ociosa; se mitiga con actividad mínima. **Plan B** si Oracle reclama: VPS de pago
(Hetzner CX22, ~4 €/mes), sin cambios de arquitectura.

---

## Alternativas consideradas

| Eje | Alternativa | Por qué se descarta (para el MVP) |
|---|---|---|
| Datos | NoSQL (Mongo) | El dominio es relacional y transaccional (colas/ofertas/auditoría); una relacional encaja mejor. |
| Datos | SQL sin ORM / query builder | Prisma da tipado y migraciones con poco coste; el MVP prioriza velocidad y corrección. |
| Framework | React SPA separada + API Node (Fastify/NestJS) | Dos proyectos/despliegues y multi-origen (o un proxy extra); Next.js unifica front+API en uno con mismo origen. La capa compartida factorizada deja reversible una futura extracción. |
| Framework | Remix / SvelteKit / Astro | Válidos, pero Next.js tiene el ecosistema/DX más extendido para un MVP → menor riesgo de fricción y más material de referencia. |
| Framework | Next.js **Pages** Router | App Router es el modelo actual (RSC, layouts anidados, streaming); Pages Router queda como legado. |
| API | Solo Server Actions (sin REST) | Rompería el requisito de **API REST pública documentada en OpenAPI** (`readme.md` §4); se usan Route Handlers REST para el contrato público. |
| API | GraphQL en vez de REST | Sobra flexibilidad de query; REST+OpenAPI es más simple de documentar/testear para este alcance. |
| Frontend | SPA pura (sin SSR) servida estática | Se prefiere Next SSR/RSC por accesibilidad/SEO del catálogo público (visitante, D13) y por unificar con la API. |
| Scheduler | Cron in-process en el servidor Next | El modelo multi-instancia de Next duplicaría el cron; se usa un proceso Node aparte en la misma VM. Reversible. |
| Hosting | Split PaaS (Vercel + Render + Neon) | Multi-origen (CORS + cookie cross-origin), *cold-start* y suspensión de BD, e imágenes en servicio aparte. La VM única mismo-origen elimina las tres fricciones a coste 0. |
| Hosting | VPS de pago (Hetzner CX22, ~4 €/mes) | Más fiable (sin reclamación), pero rompe el coste 0; reservado como **plan B** si Oracle reclama la instancia. |
| Hosting DB | Postgres gratis de Render / Neon | Caducidad/suspensión del free tier; con Postgres **local** en la VM el problema no existe. |
| Hosting DB | Railway | Ya no es gratuito con BD en 2026. |

---

## Consecuencias

**Positivas**
- Contrato API explícito (OpenAPI) → front y back desacoplados y testables por
  separado.
- Dominio aislado → los tests pueden centrarse en caminos de error y casos
  límite (máquina de estados, equidad de cola) sin levantar infraestructura.
- Tipado TS end-to-end (Prisma + API + Next) reduce errores de contrato.
- Coste operativo **0 €** permanente con el hosting elegido (§5).
- Un solo proyecto y un solo *deploy* para front + API; el back-office segmentado
  por ruta no viaja al navegador del suscriptor sin autorización. La capa
  compartida factorizada deja barata una futura extracción de la API.
- **Mismo origen** (§5): sin CORS, cookie de sesión *first-party* y sin servicio de
  imágenes aparte; latencia local y constante (sin *cold-start* ni suspensión).

**Negativas / trade-offs**
- **Ops propio**: al ser una VM y no un PaaS gestionado, TLS, parches de SO,
  firewall y backups (`pg_dump`) son responsabilidad nuestra.
- **Punto único de fallo** (todo en un host) — aceptable en un MVP de demo.
- **Riesgo de reclamación** de la instancia *always-free* de Oracle si queda
  ociosa; mitigable, con Hetzner como plan B sin cambio de arquitectura.
- El **scheduler** es un proceso desplegable aparte (systemd) — uno más que
  operar, aunque desacoplado del servidor web y sin riesgo de doble ejecución.
- **Acoplamiento front+API** en un mismo proyecto Next: si se quisiera escalar o
  independizar la API, hay que extraerla (previsto, reversible vía capa compartida).
- Prisma 6 pinneado deja una **deuda de migración** a Prisma 7 pendiente.

**Neutras / a seguir**
- Framework **decidido**: Next.js (App Router). El dominio se mantiene agnóstico
  del framework (§3), así que un cambio de capa de entrega no tocaría la lógica.
- Auth y contrato de errores de la API se deciden en `ADR-0002`; la concurrencia
  del dominio, en `design.md` D12.

---

## Cumplimiento y validación

- `openspec validate clickoteca-mvp --strict` debe seguir en verde (`tasks.md`).
- Trazabilidad specs ↔ componentes en `documents/C4-architecture.md` §4.
- Framework confirmado (Next.js, 2026-07-05) → **Estado: Aceptado**; no quedan
  *Open questions* de arquitectura.

## Referencias

- `documents/C4-architecture.md` — diagramas C4 (contexto/contenedores/componentes).
- `openspec/changes/clickoteca-mvp/design.md` — decisiones de dominio D1–D13.
- `documents/ADR-0002-api-auth-errores.md` — auth y contrato de errores de la API.
- `documents/PRD.md` — PRD y modelo de datos (§15).
- `AGENTS.md` — stack confirmado y preguntas abiertas.
