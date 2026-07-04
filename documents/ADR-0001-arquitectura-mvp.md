# ADR-0001 — Arquitectura de la aplicación (Clickoteca MVP)

- **Estado:** Propuesto. Hosting **confirmado** (VM única Oracle free, §5);
  pendiente solo el framework de frontend/backend — ver `AGENTS.md` § Open
  questions.
- **Fecha:** 2026-07-04
- **Decisores:** Xavier Vergés (owner).
- **Contexto de origen:** `openspec/changes/clickoteca-mvp/` (proposal + design +
  specs), `documents/PRD.md`, `documents/C4-architecture.md`, `prompts.md`.

> Este ADR registra las decisiones **de arquitectura de la aplicación** (stack,
> estructura, despliegue). Las decisiones **de dominio** (Set vs Copia, ciclo de
> vida, score de cola, etc.) están en `design.md` D1–D11 y no se repiten aquí.

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
- **Procesos temporales de primera clase:** recálculo de score de cola,
  caducidad de ventanas de oferta y recordatorios requieren ejecución periódica
  y por evento (`design.md` D5, D11).

---

## Decisión

Adoptar una arquitectura **de tres contenedores desplegables** (SPA + API REST +
PostgreSQL) más un **scheduler** para los procesos temporales, con las
siguientes elecciones:

### 1. Capa de datos: PostgreSQL + Prisma
Base relacional por la naturaleza fuertemente transaccional y relacional del
dominio (colas, ofertas, transiciones auditadas). Prisma como ORM por su
tipado end-to-end en TypeScript, migraciones y velocidad de desarrollo.
El esquema (20 modelos, 16 enums) vive en `backend/prisma/schema.prisma`.

> **Nota de versión:** el esquema usa `url = env("DATABASE_URL")`, válido en
> Prisma ≤6. Prisma 7 lo mueve a `prisma.config.ts`. **Pinnear Prisma 6** en el
> `package.json` del backend, o migrar la config del datasource.

### 2. Backend: API REST pública en TypeScript, documentada en OpenAPI
Arquitectura **en capas**: `rutas → casos de uso → repositorios → dominio`,
aplicando SOLID/CUPID/DRY, **sin DI pesado** si añade ceremonia innecesaria. El
dominio (máquina de estados, política de score) se aísla para ser testable sin
infraestructura. REST + OpenAPI por ser un contrato estándar, cacheable y
autodocumentado, adecuado para un CRUD-con-flujos como este.

### 3. Frontend: SPA única en TypeScript con back-office en *chunk* diferido
Una única aplicación web responsive (mobile-first, WCAG 2.1 AA) que expone el
**Portal del Suscriptor** y el **Back-office** con enrutado segmentado por rol.
El código del back-office se aísla en un ***chunk* cargado *lazy* mediante
*code-splitting***: solo se descarga cuando un usuario con rol `OPERATOR/ADMIN`
navega a esas rutas; el bundle público del suscriptor no lo transporta.

Condición de diseño desde el día uno: la **capa compartida** (cliente generado
del contrato OpenAPI, tipos, modelos de dominio, tokens de diseño) se factoriza
como módulo reutilizable, de modo que **partir a dos aplicaciones separadas más
adelante sea barato**.

**Por qué esta opción (2 de 3).** Frente a una SPA monolítica sin *split* y a dos
aplicaciones/despliegues separados desde ya, la SPA única con *code-splitting*:
- Captura casi toda la ventaja de rendimiento (bundle del suscriptor ligero) y de
  exposición (el *chunk* de back-office ni se descarga sin rol) con **coste de
  setup casi nulo**.
- No parte en dos el *time-to-demo*, criterio de éxito del MVP (circuito E2E
  demostrable cuanto antes, PRD §10).
- La autorización real la impone la API server-side (§2, `accounts-roles`), así
  que el *split* de frontend es *defense-in-depth*/UX, no una frontera de
  seguridad — no urge separarlo físicamente en el MVP.

Se pospone la separación en dos aplicaciones a una futura iteración; se adoptaría
solo si domina un factor concreto (back-office no accesible públicamente tras
*allowlist*/VPN, auth de staff endurecida, o design systems muy divergentes).
Gracias a la capa compartida factorizada, esa migración no toca la API.

### 4. Procesos programados (scheduler)
**Caducidad de ventanas de oferta** (`design.md` D5) y **recordatorios** (D7) se
implementan como procesos programados que **reutilizan los casos de uso** del
dominio. El **orden de cola ya no requiere recálculo**: se ordena de forma *lazy*
sobre `entrada_efectiva` inmutable (D11 revisado), así que el scheduler pierde esa
responsabilidad. Corre **in-process** en la API (`node-cron`); al residir todo en la
misma VM (§5), esa es su ubicación natural.

### 5. Hosting: VM única con IP pública (Oracle Cloud Free Tier)
Un **único servidor Linux** aloja todo el sistema. Un **reverse proxy**
(Caddy/nginx) sirve la SPA estática y enruta `/api` al backend Node; **PostgreSQL**
corre **local** (escuchando solo en `localhost`); las **imágenes** del catálogo se
guardan en el **filesystem** del host y se sirven como estáticos.

- **Proveedor:** Oracle Cloud **Free Tier**, instancia **Ampere A1 (ARM64 /
  aarch64)**, *always-free*.
- **Specs:** **2 OCPU · 12 GB RAM · 50 GB** de Block Volume · **Ubuntu 24.04 LTS**
  (holgadamente dentro del envelope *always-free*: 4 OCPU / 24 GB / 200 GB). Con
  este dimensionamiento el pico de *build* en la propia VM no da OOM.
- **Arquitectura ARM64:** todos los componentes son arm64-nativos (Node,
  PostgreSQL, Caddy) — sin fricción.
- **TLS:** Caddy con Let's Encrypt automático (necesario para la cookie `Secure`,
  ver `ADR-0002`).
- **Firewall:** exponer solo 80/443 (y 22 para administración); **Postgres nunca en
  la IP pública**.
- **Backups:** `pg_dump` por cron (ya no hay backups gestionados de un PaaS).

**Por qué esta opción.** Al residir SPA, API, imágenes y BD en el **mismo origen**:
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
| API | GraphQL | Sobra flexibilidad de query; REST+OpenAPI es más simple de documentar y testear para este alcance. |
| API | Monolito con vistas server-rendered | Se prefiere separar SPA/API para un contrato claro y front desacoplado. |
| Frontend | SPA monolítica sin *code-splitting* | Enviaría el código del back-office a todos los navegadores sin ninguna ventaja de separar. |
| Frontend | Dos apps/despliegues separados desde ya | Duplicación (paquete compartido), dos pipelines y más scaffolding → *time-to-demo* más lento; innecesario en el MVP. Pospuesto, reversible. |
| Scheduler | Worker desplegado aparte | in-process basta para el MVP y comparte VM con la API. Reversible. |
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
- Tipado TS end-to-end (Prisma + API + SPA) reduce errores de contrato.
- Coste operativo **0 €** permanente con el hosting elegido (§5).
- Bundle del suscriptor ligero (back-office en *chunk* diferido) sin renunciar a un
  único deploy; la capa compartida factorizada deja barata una futura separación.
- **Mismo origen** (§5): sin CORS, cookie de sesión *first-party* y sin servicio de
  imágenes aparte; latencia local y constante (sin *cold-start* ni suspensión).

**Negativas / trade-offs**
- **Ops propio**: al ser una VM y no un PaaS gestionado, TLS, parches de SO,
  firewall y backups (`pg_dump`) son responsabilidad nuestra.
- **Punto único de fallo** (todo en un host) — aceptable en un MVP de demo.
- **Riesgo de reclamación** de la instancia *always-free* de Oracle si queda
  ociosa; mitigable, con Hetzner como plan B sin cambio de arquitectura.
- Scheduler in-process acopla los procesos temporales al ciclo de vida de la
  API; si se necesitara escalar habría que extraerlo (previsto, reversible).
- Prisma 6 pinneado deja una **deuda de migración** a Prisma 7 pendiente.

**Neutras / a seguir**
- Frameworks concretos de front y back **sin decidir**: esta arquitectura no los
  presupone (cualquier stack TS de SPA + API REST encaja).
- Auth y contrato de errores de la API se deciden en `ADR-0002`; la concurrencia
  del dominio, en `design.md` D12.

---

## Cumplimiento y validación

- `openspec validate clickoteca-mvp --strict` debe seguir en verde (`tasks.md`).
- Trazabilidad specs ↔ componentes en `documents/C4-architecture.md` §4.
- Este ADR se revisará al cerrar la última *Open question* de `AGENTS.md`
  (frameworks): al confirmarse, se actualiza el **Estado** a "Aceptado".

## Referencias

- `documents/C4-architecture.md` — diagramas C4 (contexto/contenedores/componentes).
- `openspec/changes/clickoteca-mvp/design.md` — decisiones de dominio D1–D12.
- `documents/ADR-0002-api-auth-errores.md` — auth y contrato de errores de la API.
- `documents/PRD.md` — PRD y modelo de datos (§15).
- `AGENTS.md` — stack confirmado y preguntas abiertas.
