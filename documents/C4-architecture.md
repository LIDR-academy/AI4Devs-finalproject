# Arquitectura C4 — Clickoteca MVP

> **Estado:** borrador para revisión. Derivado de los specs de
> `openspec/changes/clickoteca-mvp/` (`proposal.md`, `design.md`, `specs/*`),
> del modelo de datos de `documents/PRD.md` §15 y de las decisiones de stack
> registradas en `AGENTS.md`.
>
> Los diagramas siguen el [modelo C4](https://c4model.com/) (Contexto →
> Contenedores → Componentes) en notación Mermaid. Se documentan los niveles 1
> a 3; el nivel 4 (código) se omite por convención C4 (lo cubre el propio código
> y `prisma/schema.prisma`).
>
> **Stack confirmado:** **Next.js full-stack** (App Router, TypeScript) para
> front + API REST (Route Handlers en `app/api/*`, OpenAPI), **PostgreSQL +
> Prisma**, scheduler en proceso aparte. **Hosting** en VM única Oracle Ampere
> free, mismo origen (`ADR-0001` §2 y §5). No quedan *Open questions* de
> arquitectura.
>
> Última actualización: 2026-07-05.

---

## 1. Nivel 1 — Diagrama de contexto del sistema

Enmarca **quién** usa Clickoteca y con **qué sistemas externos** interactúa. En
el MVP los tres sistemas externos están **simulados** (pagos, logística y
correo son *non-goals*, ver `proposal.md`): se dibujan para fijar la frontera
real del producto, pero su implementación es un mock o una acción manual del
operador.

```mermaid
C4Context
    title Contexto del sistema — Clickoteca MVP

    Person(subscriber, "Suscriptor", "Cliente autenticado. Explora el catálogo, contrata plan, solicita sets, entra en colas, confirma ofertas y gestiona devoluciones.")
    Person(operator, "Operador", "Empleado de back-office. Gestiona el ciclo de vida de las copias: alta, condición de entrega, recepción, inspección e higienización.")
    Person(admin, "Admin", "Gestión y configuración. Hereda al operador y añade: baja de copias, planes/reglas, empleados e historial completo.")

    System(clickoteca, "Clickoteca", "Biblioteca de sets de Lego por suscripción. Circuito E2E: suscripción → cola → alquiler → devolución → inspección → higienización → de vuelta a disponible.")

    System_Ext(payments, "Pasarela de pagos (SIMULADA)", "Non-goal del MVP: los cargos de cuota mensual y alquiler puntual se registran como pagos simulados.")
    System_Ext(logistics, "Logística de mensajería (MANUAL)", "Non-goal del MVP: el movimiento físico (envío/recogida) lo marca a mano un operador; el estado de envío se registra pero no se automatiza.")
    System_Ext(email, "Correo / mensajería saliente (SIMULADA)", "Non-goal del MVP: las notificaciones se persisten in-app; el envío por email queda mockeado.")

    Rel(subscriber, clickoteca, "Explora catálogo, gestiona suscripción y alquileres", "HTTPS")
    Rel(operator, clickoteca, "Opera el ciclo de vida de las copias", "HTTPS")
    Rel(admin, clickoteca, "Configura y administra", "HTTPS")

    Rel(clickoteca, payments, "Registra cargos", "simulado")
    Rel(clickoteca, logistics, "Registra envíos/recogidas", "manual (operador)")
    Rel(clickoteca, email, "Emite notificaciones", "in-app / email simulado")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

**Notas de contexto**

- Cada cuenta tiene **exactamente un rol** (`SUBSCRIBER | OPERATOR | ADMIN`);
  `Admin` hereda las capacidades de `Operador` (ver PRD §14.2 y `design.md` D6).
- La frontera de los tres sistemas externos es real de cara a una futura
  producción, pero en el MVP su implementación es simulada/manual: por eso el
  valor de referencia del Set y el registro de condición de entrega se guardan
  ya (base documental de una reclamación futura), aunque no se cobren
  penalizaciones (`design.md` D8, D9).

---

## 2. Nivel 2 — Diagrama de contenedores

Descompone Clickoteca en unidades lógicas. El stack está confirmado: **Next.js
full-stack** (App Router) sirve front + API REST (OpenAPI) sobre **PostgreSQL +
Prisma**, con un **scheduler** en proceso aparte. Los procesos **conviven en una
única VM** (Oracle Ampere free, mismo origen — ver `ADR-0001` §5): la app Next y
el scheduler son dos procesos Node; Postgres corre local.

```mermaid
C4Container
    title Contenedores — Clickoteca MVP

    Person(subscriber, "Suscriptor", "Portal de cliente")
    Person(backoffice, "Operador / Admin", "Back-office")

    System_Boundary(clickoteca, "Clickoteca — VM única (Oracle Ampere free, mismo origen)") {
        Container(web, "Aplicación Next.js (front + API)", "Next.js App Router, TypeScript; proceso Node tras el reverse proxy", "SSR/RSC responsive mobile-first, WCAG 2.1 AA. Portal del Suscriptor y Back-office segmentados por rol (route groups + middleware). API REST pública en app/api/* documentada en OpenAPI; arquitectura en capas: Route Handlers → casos de uso → repositorios → dominio.")
        Container(scheduler, "Procesos programados", "TypeScript, proceso Node aparte (node-cron)", "Caducidad de ventanas de oferta y recordatorios de retención y de mitad de ventana. Disparan notificaciones y ofertas. Proceso separado para no duplicarse con el modelo multi-instancia de Next. El orden de cola NO se recalcula (D11).")
        ContainerDb(db, "Base de datos", "PostgreSQL + Prisma; local en la VM (localhost)", "20 modelos / 16 enums. Estado del dominio, colas, ofertas, auditoría y notificaciones persistidas.")
    }

    System_Ext(payments, "Pasarela de pagos (SIMULADA)", "Mock")
    System_Ext(logistics, "Logística (MANUAL)", "Operador")
    System_Ext(email, "Correo saliente (SIMULADO)", "Mock")

    Rel(subscriber, web, "Usa", "HTTPS")
    Rel(backoffice, web, "Usa", "HTTPS")

    Rel(web, db, "Lee y escribe", "SQL vía Prisma")
    Rel(scheduler, db, "Caduca ofertas, marca recordatorios", "SQL vía Prisma")
    Rel(scheduler, web, "Comparte la capa de casos de uso (mismo código)", "módulo compartido")

    Rel(web, payments, "Registra pagos", "simulado")
    Rel(web, logistics, "Registra envíos", "manual")
    Rel(web, email, "Encola notificaciones", "in-app / simulado")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

**Notas de contenedores**

- **App Next.js única con dos superficies.** El PRD modela dos caras (Portal del
  Suscriptor y Back-office, §14.1/§14.2); se implementan en **un solo proyecto
  Next** (App Router) con **route groups + middleware** por rol. El
  *code-splitting* por ruta lo da Next de serie: el código de back-office no viaja
  al navegador del suscriptor sin autorización. La API pública vive en el mismo
  proyecto (`app/api/*`, Route Handlers REST + OpenAPI). La capa compartida
  (tipos, dominio, cliente OpenAPI) se factoriza para dejar barata una futura
  extracción de la API. Ver `ADR-0001` §2–§3.
- **Scheduler.** Solo cubre eventos **genuinamente temporales**: la gestión de la
  ventana de confirmación (D5, UC-P16/17) y los recordatorios (D7). El **orden de
  cola ya no se recalcula** — se deriva de forma *lazy* sobre `entrada_efectiva`
  inmutable (`design.md` D11 revisado), así que el antiguo "recálculo de score"
  desaparece del scheduler. Corre como **proceso Node aparte** (`node-cron`) en la
  misma VM —**no** in-process en Next: su modelo multi-instancia duplicaría el
  cron—; reutiliza la misma capa de casos de uso importándola como módulo.
- **Hosting (decidido):** **VM única** con IP pública en **Oracle Cloud Free Tier**
  (Ampere A1 / ARM64, 2 OCPU · 12 GB · 50 GB). Un reverse proxy (Caddy) termina TLS
  y enruta al servidor Next (front + `/api`); Postgres corre en `localhost`; las
  imágenes viven en el filesystem. **Mismo origen** → sin CORS y cookie de sesión
  *first-party* (`ADR-0002`). Alternativas descartadas y trade-offs (ops propio,
  punto único de fallo, plan B Hetzner) en `ADR-0001` §5.

---

## 3. Nivel 3 — Diagrama de componentes de la API (Route Handlers de Next.js)

Detalle interno de la **capa API** de la app Next (Route Handlers en `app/api/*`),
siguiendo la arquitectura en capas declarada (Route Handlers → casos de uso →
repositorios → dominio) y organizado por las seis *capabilities* de los specs. Se
aplican SOLID/CUPID/DRY sin DI pesado. El dominio y los casos de uso son módulos
TS agnósticos de Next (los reutilizan tanto los Route Handlers como el scheduler).

```mermaid
C4Component
    title Componentes — API REST (Clickoteca MVP)

    Person(subscriber, "Suscriptor", "")
    Person(backoffice, "Operador / Admin", "")
    ContainerDb(db, "PostgreSQL + Prisma", "", "Estado del dominio")
    Container(scheduler, "Procesos programados", "", "Caducidades / recordatorios")

    Container_Boundary(api, "API (Route Handlers Next.js)") {

        Component(router, "Capa HTTP (Route Handlers)", "Next app/api/* + Zod + OpenAPI", "Enrutado, validación de request/response con Zod contra el contrato OpenAPI, serialización.")
        Component(authz, "Auth y autorización", "Middleware", "Autenticación y control de acceso por rol (SUBSCRIBER/OPERATOR/ADMIN).")

        Component(ucAccounts, "Casos de uso · Cuentas y roles", "Application", "Registro, login, perfil y dirección de envío (afecta a envíos futuros).")
        Component(ucCatalog, "Casos de uso · Catálogo e inventario", "Application", "Sets vs Copias, publicación (exige valor de referencia), alta de copias.")
        Component(ucSubs, "Casos de uso · Suscripciones", "Application", "Planes BASIC/PREMIUM, alquiler puntual, elegibilidad, cancelación (camino feliz).")
        Component(ucRentals, "Casos de uso · Alquileres y devoluciones", "Application", "Solicitud/asignación, condición de entrega, devolución, inspección e higienización.")
        Component(ucQueue, "Casos de uso · Cola de reservas", "Application", "Unirse a cola, ofrecer al cabeza elegible, confirmar/rechazar/caducar, re-encolar.")
        Component(ucNotif, "Casos de uso · Notificaciones", "Application", "Emisión de notificaciones dirigidas por eventos de dominio (in-app).")

        Component(domain, "Dominio", "Entidades + políticas", "Máquina de estados de la Copia (9 estados), política de cola (aditiva, entrada efectiva inmutable), reglas de elegibilidad y auditoría quién/cuándo.")

        Component(repos, "Repositorios", "Prisma", "Acceso a datos por agregado; encapsula Prisma tras interfaces.")

        Component(payAdapter, "Adaptador de pagos (simulado)", "Infra", "Registra pagos simulados.")
        Component(shipAdapter, "Adaptador de logística (manual)", "Infra", "Registra envíos/recogidas marcados por operador.")
        Component(notifDispatch, "Despachador de notificaciones", "Infra", "Persiste la notificación in-app; email mockeado.")
    }

    Rel(subscriber, router, "Solicita", "JSON/HTTPS")
    Rel(backoffice, router, "Solicita", "JSON/HTTPS")
    Rel(router, authz, "Valida sesión y rol")

    Rel(router, ucAccounts, "Invoca")
    Rel(router, ucCatalog, "Invoca")
    Rel(router, ucSubs, "Invoca")
    Rel(router, ucRentals, "Invoca")
    Rel(router, ucQueue, "Invoca")
    Rel(router, ucNotif, "Invoca")

    Rel(ucAccounts, domain, "Aplica reglas")
    Rel(ucCatalog, domain, "Aplica reglas")
    Rel(ucSubs, domain, "Aplica reglas")
    Rel(ucRentals, domain, "Aplica máquina de estados")
    Rel(ucQueue, domain, "Aplica política de score")
    Rel(ucRentals, ucNotif, "Emite eventos")
    Rel(ucQueue, ucNotif, "Emite eventos")

    Rel(ucAccounts, repos, "Persiste")
    Rel(ucCatalog, repos, "Persiste")
    Rel(ucSubs, repos, "Persiste")
    Rel(ucRentals, repos, "Persiste")
    Rel(ucQueue, repos, "Persiste")
    Rel(ucNotif, notifDispatch, "Envía")

    Rel(ucSubs, payAdapter, "Registra cargo simulado")
    Rel(ucRentals, shipAdapter, "Registra envío manual")

    Rel(repos, db, "SQL", "Prisma")
    Rel(notifDispatch, db, "Persiste notificación")
    Rel(scheduler, ucQueue, "Caduca ofertas / re-encola")
    Rel(scheduler, ucNotif, "Dispara recordatorios")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

**Notas de componentes**

- **Corte por capability + capas.** Cada slice de `specs/*` tiene su grupo de
  casos de uso; todos comparten el **dominio** (máquina de estados de la copia y
  política de score) y los **repositorios** Prisma. Es la traducción directa de
  "rutas → casos de uso → repositorios → dominio" de `AGENTS.md`.
- **El dominio concentra las invariantes.** La transición de estados de la
  `Copy` (guardada por *compare-and-swap*, `design.md` D12) y la política de cola
  (`score = días_esperando + bono_plan`, congelada en `entrada_efectiva` al
  encolar, D11) viven en el dominio, no en los controllers ni en SQL, para que
  sean testables de forma aislada (criterio de tests de caminos de error, PRD §10).
- **El scheduler reutiliza casos de uso.** No duplica lógica: importa los mismos
  casos de uso de cola/notificaciones que la API, coherente con que corra como
  proceso Node aparte que comparte esa capa (nivel 2).
- **Adaptadores de infraestructura** aíslan lo simulado (pagos, logística,
  email): sustituirlos por integraciones reales en el futuro no toca el dominio.

---

## 4. Trazabilidad specs ↔ componentes

| Capability (`specs/*`)   | Casos de uso PRD          | Componente API (nivel 3)                  |
|--------------------------|---------------------------|-------------------------------------------|
| `accounts-roles`         | UC-P03/P04/P11, UC-B08/B13/B14 | Casos de uso · Cuentas y roles       |
| `catalog-inventory`      | UC-P01/P02, UC-B02        | Casos de uso · Catálogo e inventario      |
| `subscriptions`          | UC-P05/P14, UC-B10/B11    | Casos de uso · Suscripciones              |
| `rentals-returns`        | UC-P06/P12/P13, UC-B03–B07/B09 | Casos de uso · Alquileres y devoluciones |
| `reservation-queue`      | UC-P07/P08/P09/P15/P16/P17 | Casos de uso · Cola de reservas + scheduler |
| `notifications`          | UC-P18, UC-B12            | Casos de uso · Notificaciones + despachador |

---

## 5. Decisiones de arquitectura relacionadas

- Decisiones **de dominio** (D1–D13, incl. concurrencia por CAS, orden de cola
  inmutable y visitante no autenticado): `openspec/changes/clickoteca-mvp/design.md`.
- Decisiones **de arquitectura de la aplicación** (stack, capas, hosting,
  scheduler): `documents/ADR-0001-arquitectura-mvp.md`.
- Decisiones **de la API** (auth por cookie de sesión, contrato de errores RFC
  9457): `documents/ADR-0002-api-auth-errores.md`.
