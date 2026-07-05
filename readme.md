## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Nombre completo: Xavier Vergés Marín**

### **0.2. Nombre del proyecto: **

Clickoteca

### **0.3. Descripción breve del proyecto:**

**Clickoteca** es una *biblioteca de sets de Lego por suscripción*: el
suscriptor recibe un set, lo disfruta y lo devuelve para pedir otro. Este PRD
cubre el **MVP**: el circuito completo end-to-end (suscripción → selección →
cola de reservas → alquiler → devolución → inspección → higienización → vuelta
a circulación), tanto desde la cara del **suscriptor** como desde el
**back-office** (operadores + admin).

### **0.4. URL del proyecto:**

https://github.com/xaviverges/AI4Devs-finalproject-xvm/tree/project-xvm

### 0.5. URL o archivo comprimido del repositorio

Repositorio público en GitHub: https://github.com/xaviverges/AI4Devs-finalproject-xvm
(rama de trabajo `project-xvm`).


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

Los sets de Lego son caros, se montan una vez y luego ocupan espacio: coste +
almacenamiento + "ya me aburrí". **Clickoteca** resuelve ese dolor con un modelo
de **biblioteca por suscripción**: el usuario paga una cuota mensual (o un
alquiler puntual) para disfrutar sets sin comprarlos ni quedárselos —los recibe,
los monta, los devuelve y pide el siguiente—.

- **Para quién:** aficionados al Lego (adultos) que quieren rotar sets sin
  acumularlos, y el equipo de **back-office** (operadores y admin) que gestiona el
  inventario físico.
- **Valor aportado:** acceso rotativo a un catálogo curado a cambio de una cuota,
  con una **cola de reservas justa** (la espera pesa más que el dinero) y un
  circuito operativo que garantiza que cada copia vuelve inspeccionada e
  higienizada a circulación.

> El alcance de este entregable es el **MVP**: el circuito end-to-end completo
> (suscripción → selección → cola → alquiler → devolución → inspección →
> higienización → vuelta a circulación) desde la cara del suscriptor y la del
> back-office. Pagos, logística y correo saliente son **non-goals** y quedan
> simulados/manuales.

### **1.2. Características y funcionalidades principales:**

- **Acceso público del visitante:** un usuario sin sesión explora una
  **proyección pública** del catálogo (sets publicados, foto, nº de piezas, tema,
  dificultad), consulta los planes y puede darse de alta. La **disponibilidad** y
  todo lo de nivel copia/cola exigen login.
- **Alta y suscripción:** registro con declaración de mayoría de edad, tarjeta
  (simulada), dirección de envío obligatoria y aceptación de condiciones. Planes
  **BASIC** (1 set simultáneo) y **PREMIUM** (hasta 2 + bono de cola), o
  **alquiler puntual** sin suscripción.
- **Catálogo e inventario en dos niveles:** **Set** (modelo de catálogo, no
  publicable sin valor de referencia) vs. **Copia** (unidad física con su propio
  ciclo de vida de 9 estados: `INTAKE → DISPONIBLE ⇄ OFRECIDA → ALQUILADA →
  EN_DEVOLUCION → EN_INSPECCION → EN_HIGIENIZACION`, con ramas a `INCOMPLETA` y
  `BAJA`).
- **Solicitud de sets y cola de reservas justa:** si hay copia disponible se
  asigna directa; si no, el suscriptor entra en una cola ordenada por **prioridad
  aditiva** (antigüedad de espera + bono de plan, nunca multiplicativa) — la
  espera siempre puede superar la ventaja premium.
- **Ofertas con ventana de confirmación:** al liberarse una copia se ofrece al
  cabeza de cola elegible; el suscriptor acepta, rechaza (pasa al instante al
  siguiente) o la deja caducar (con recordatorio a mitad de ventana → vuelve al
  final con prioridad reducida, no se le expulsa).
- **Registro de condición y devolución:** el operador documenta el estado de la
  copia (checklist/foto) antes de enviarla; el suscriptor puede reportar
  discrepancia en la entrega sin que se le impute. La devolución pasa por
  **inspección** e **higienización** como **dos pasos separados** antes de volver
  a circulación.
- **Historial del suscriptor ("Mis sets"):** sets en préstamo, histórico de
  alquileres pasados y posición en cada cola activa.
- **Cancelación (camino feliz):** solo cuando no se tiene ninguna copia en poder y
  no hay devoluciones ni saldo pendientes.
- **Back-office y administración:** gestión del ciclo de vida de las copias
  (alta, recepción, inspección, higienización, marcado de incompletas/dañadas),
  con **baja de copias exclusiva de admin** y configuración de reglas
  (precios, bono de cola, ventana de confirmación, antigüedad mínima, límite de
  colas, recordatorios de retención). **Auditoría quién/cuándo** en toda
  transición de estado y acción administrativa.

### **1.3. Diseño y experiencia de usuario:**

> **Pendiente.** El diseño visual, los wireframes y el videotutorial de la
> experiencia de usuario quedan pendientes de la fase de implementación (ver
> `documents/PRD.md` §9). La navegación funcional está definida como casos de uso
> (PRD §14) y como historias de usuario (`documents/user_stories.md`, resumidas en
> §5). Objetivos transversales de UX ya fijados: **responsive mobile-first** y
> **accesibilidad WCAG 2.1 AA** (EN 301 549 / European Accessibility Act).

### **1.4. Instrucciones de instalación:**

> **Estado actual del repositorio.** El proyecto está en fase de **diseño y
> especificación completos**: el modelo de datos ya está implementado en Prisma
> (`backend/prisma/schema.prisma`, 20 modelos / 16 enums) y toda la arquitectura
> está decidida y documentada (ver §2 y `documents/ADR-0001`/`ADR-0002`). El
> scaffolding de la aplicación Next.js aún no está generado, por lo que las
> instrucciones siguientes describen el arranque **previsto** según la
> arquitectura confirmada.

Requisitos previstos: **Node.js 20+**, **PostgreSQL 16** y **Prisma 6** (pinneado;
el esquema usa `url = env("DATABASE_URL")`, forma válida en Prisma ≤6).

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/xaviverges/AI4Devs-finalproject-xvm
cd AI4Devs-finalproject-xvm

# 2. Configurar la base de datos (variable DATABASE_URL en el .env del backend)
#    Ej.: postgresql://user:pass@localhost:5432/clickoteca

# 3. Aplicar el esquema y generar el cliente Prisma
cd backend
npx prisma migrate dev      # crea las tablas a partir de schema.prisma
npx prisma generate         # genera el cliente tipado

# 4. (Previsto) semillas del catálogo desde el dataset público de Rebrickable
#    npx prisma db seed

# 5. (Previsto) levantar la app Next.js full-stack + el scheduler
#    npm run dev             # front (SSR/RSC) + API REST en /api
#    npm run scheduler       # proceso Node aparte (node-cron)
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Patrón:** aplicación **Next.js full-stack** (App Router, TypeScript) que sirve
front (SSR/RSC) y **API REST pública** (Route Handlers en `app/api/*` + OpenAPI)
en un solo proyecto, sobre **PostgreSQL + Prisma**, con **arquitectura en capas**
(Route Handlers → casos de uso → repositorios → dominio) y un **scheduler** como
proceso Node aparte. Todo se despliega en una **VM única** (mismo origen). El
detalle está en `documents/C4-architecture.md` (C4 niveles 1–3) y en
`documents/ADR-0001`.

```mermaid
C4Container
    title Contenedores — Clickoteca MVP

    Person(subscriber, "Suscriptor", "Portal de cliente")
    Person(backoffice, "Operador / Admin", "Back-office")

    System_Boundary(clickoteca, "Clickoteca — VM única (Oracle Ampere free, mismo origen)") {
        Container(web, "Aplicación Next.js (front + API)", "Next.js App Router, TypeScript", "SSR/RSC responsive mobile-first, WCAG 2.1 AA. Portal del Suscriptor y Back-office segmentados por rol (route groups + middleware). API REST pública en app/api/* con OpenAPI; capas: Route Handlers → casos de uso → repositorios → dominio.")
        Container(scheduler, "Procesos programados", "TypeScript, proceso Node aparte (node-cron)", "Caducidad de ventanas de oferta y recordatorios. El orden de cola NO se recalcula (D11).")
        ContainerDb(db, "Base de datos", "PostgreSQL + Prisma; local (localhost)", "20 modelos / 16 enums. Estado del dominio, colas, ofertas, auditoría y notificaciones.")
    }

    System_Ext(payments, "Pasarela de pagos (SIMULADA)", "Mock")
    System_Ext(logistics, "Logística (MANUAL)", "Operador")
    System_Ext(email, "Correo saliente (SIMULADO)", "Mock")

    Rel(subscriber, web, "Usa", "HTTPS")
    Rel(backoffice, web, "Usa", "HTTPS")
    Rel(web, db, "Lee y escribe", "SQL vía Prisma")
    Rel(scheduler, db, "Caduca ofertas, marca recordatorios", "SQL vía Prisma")
    Rel(scheduler, web, "Comparte la capa de casos de uso", "módulo compartido")
    Rel(web, payments, "Registra pagos", "simulado")
    Rel(web, logistics, "Registra envíos", "manual")
    Rel(web, email, "Encola notificaciones", "in-app / simulado")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

**Por qué esta arquitectura y sus trade-offs**

- **Next.js unifica front + API** en un proyecto y un despliegue, coherente con el
  hosting **mismo-origen**: sin CORS y con cookie de sesión *first-party*. Se
  descartó un split SPA + API separada (dos despliegues, multi-origen).
- **Dominio agnóstico del framework:** la máquina de estados de la copia y la
  política de cola viven en una capa TS pura, testable sin levantar el servidor.
  Habilita el criterio de éxito del MVP: **cobertura de caminos de error**.
- **Scheduler en proceso aparte** porque el modelo multi-instancia de Next
  duplicaría un cron in-process.
- **Sacrificios:** se pasa a **ops propio** (TLS, parches, firewall, backups) y a
  un **punto único de fallo** — aceptable en un MVP de demo. Prisma 6 pinneado deja
  una deuda de migración a Prisma 7.

### **2.2. Descripción de componentes principales:**

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| **Aplicación Next.js (front + API)** | Next.js App Router, TypeScript | Sirve el front SSR/RSC (Portal del Suscriptor + Back-office segmentados por rol con route groups + middleware) y la API REST pública en `app/api/*`. |
| **Capa HTTP (Route Handlers)** | Next `app/api/*` + **Zod** + OpenAPI | Enrutado, validación de request/response contra el contrato OpenAPI (Zod alimenta el spec) y serialización. |
| **Auth y autorización** | Middleware server-side | Sesión por cookie y control de acceso por rol (`SUBSCRIBER/OPERATOR/ADMIN`) — la frontera de seguridad real. |
| **Casos de uso (Application)** | TypeScript puro | Una porción por capability: cuentas, catálogo, suscripciones, alquileres/devoluciones, cola, notificaciones. |
| **Dominio** | Entidades + políticas TS | Máquina de estados de la Copia (9 estados), política de cola aditiva con entrada efectiva inmutable, elegibilidad y auditoría. |
| **Repositorios** | Prisma | Acceso a datos por agregado; encapsula Prisma tras interfaces. |
| **Scheduler** | Node + node-cron | Caducidad de ofertas y recordatorios; reutiliza los mismos casos de uso. |
| **Adaptadores de infra** | Mocks / manual | Pagos simulados, logística manual y despacho de notificaciones (in-app; email mockeado). |
| **Base de datos** | PostgreSQL + Prisma | 20 modelos / 16 enums; incluye tabla de sesiones. |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El repositorio sigue hoy una estructura **documentation-first** (specs y modelo de
datos antes que código). Estructura actual y prevista:

```
AI4Devs-finalproject-xvm/
├── README.md                 # Este entregable
├── AGENTS.md                 # Memoria y acuerdos de trabajo del proyecto
├── prompts.md                # Log de prompts de la generación asistida
├── backend/
│   └── prisma/
│       └── schema.prisma     # Modelo de datos ejecutable (20 modelos / 16 enums)
├── documents/
│   ├── PRD.md                # PRD completo (incluye §15 modelo de datos)
│   ├── C4-architecture.md    # Diagramas C4 niveles 1–3 (Mermaid)
│   ├── ADR-0001-arquitectura-mvp.md   # Stack, capas, hosting, scheduler
│   ├── ADR-0002-api-auth-errores.md   # Auth por sesión + contrato de errores
│   └── user_stories.md       # Historias de usuario (Gherkin) HU-00..HU-17
└── openspec/
    └── changes/clickoteca-mvp/        # Cambio OpenSpec (fuente de verdad)
        ├── proposal.md · design.md (D1–D13) · tasks.md
        └── specs/            # 6 capabilities: accounts-roles, catalog-inventory,
                              # subscriptions, rentals-returns, reservation-queue,
                              # notifications
```

Estructura **prevista** de la app Next.js (según `ADR-0001` §2–§3): `app/(portal)/…`
y `app/(backoffice)/…` (route groups por rol), `app/api/*` (Route Handlers REST), y
una **capa compartida** (dominio, casos de uso, cliente OpenAPI, tipos) factorizada
para dejar barata una futura extracción de la API.

### **2.4. Infraestructura y despliegue**

**Hosting (decidido):** una **VM única** con IP pública en **Oracle Cloud Free
Tier** (Ampere A1 / ARM64, 2 OCPU · 12 GB RAM · 50 GB, Ubuntu 24.04 LTS,
*always-free*).

```mermaid
flowchart TB
    user([Usuario / navegador]) -->|HTTPS 443| caddy
    subgraph vm["VM única — Oracle Ampere A1 (ARM64)"]
        caddy["Caddy (reverse proxy)<br/>TLS Let's Encrypt"]
        next["Servidor Next.js<br/>(front + /api) · systemd"]
        sched["Scheduler Node<br/>(node-cron) · systemd"]
        pg[("PostgreSQL<br/>localhost")]
        fs["Imágenes en filesystem"]
        caddy --> next
        next --> pg
        sched --> pg
        next --> fs
    end
```

- **Reverse proxy Caddy** termina TLS (Let's Encrypt automático, necesario para la
  cookie `Secure`) y enruta al servidor Next (front + `/api`).
- **PostgreSQL local** escuchando solo en `localhost` (**nunca** en la IP pública).
- **Imágenes** del catálogo en el filesystem del host → **mismo origen** (sin
  CORS, cookie *first-party*).
- **Despliegue:** `next build` (output *standalone*) + `next start` gestionado por
  **systemd**; el scheduler es otro servicio systemd. **Firewall:** solo 80/443 y
  22. **Backups:** `pg_dump` por cron.
- **Plan B** si Oracle reclama la instancia *free*: VPS de pago (Hetzner CX22,
  ~4 €/mes) sin cambios de arquitectura.

### **2.5. Seguridad**

Decidido en `documents/ADR-0002`:

- **Sesión server-side por cookie:** identificador opaco en cookie `httpOnly` +
  `Secure` + `SameSite=Lax`; el estado de sesión se persiste en Postgres. La
  **revocación es trivial** (se borra la sesión) — por eso no JWT.
- **Passwords con argon2id** (bcrypt como alternativa aceptable).
- **Autorización por rol en middleware server-side:** es la frontera de seguridad
  real; la segmentación por rutas de Next es *defense-in-depth* / UX, no seguridad.
- **CSRF:** cubierto por `SameSite=Lax` y por el despliegue **mismo origen** (sin
  POST cross-site en el MVP).
- **Contrato de errores estable (RFC 9457, Problem Details):**
  `application/problem+json` con un miembro `code` de dominio cerrado
  (`COPY_STATE_CONFLICT`, `QUEUE_LIMIT_EXCEEDED`, `OFFER_EXPIRED`, `NOT_ELIGIBLE`,
  `UNAUTHENTICATED`, `FORBIDDEN`, …). **500 nunca filtra interno** (sin stack traces
  al cliente).
- **Concurrencia por compare-and-swap** en las transiciones de estado de la copia
  (`design.md` D12) → conflictos como **HTTP 409**, evitando dobles asignaciones.

### **2.6. Tests**

> **Pendiente de implementación.** La estrategia de tests está definida pero aún no
> escrita (la app no está scaffoldeada). El **criterio de éxito del MVP** (PRD §10)
> es precisamente la **cobertura de caminos de error**, no KPIs de escala. El diseño
> lo habilita: el dominio (máquina de estados, política de cola) es un módulo TS
> puro testable de forma aislada, sin levantar infraestructura.

Casos de test previstos como prioritarios:

- **Máquina de estados de la copia:** solo se aceptan las transiciones válidas; una
  transición inválida o sobre un estado ya cambiado devuelve **409** (CAS).
- **Equidad de la cola:** un BASIC con espera suficiente supera a un PREMIUM recién
  encolado (prioridad **aditiva**); el orden por `effectiveEntryAt` inmutable no
  cambia con el paso del tiempo.
- **Ventana de confirmación:** aceptar/rechazar/caducar; el rechazo pasa la oferta
  al instante; la caducidad re-encola con penalización.
- **Elegibilidad:** no solicitar un nuevo set con una devolución sin completar;
  límite de colas simultáneas; baja de copia rechazada para operador (solo admin).

---

## 3. Modelo de Datos

Capa de datos en **PostgreSQL + Prisma**. El esquema ejecutable vive en
[`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) y su especificación
detallada (con diagramas por anillos de importancia y decisiones de modelado) en
[`documents/PRD.md` §15](documents/PRD.md). Los modelos van en inglés (convención
Prisma) y mapean a los términos de dominio en español.

Las entidades se organizan en tres anillos por orden de importancia:

- **Anillo 1 — Núcleo del circuito E2E:** `User`, `Set`, `Copy`, `Subscription`,
  `Rental`, `ReservationQueueEntry`, `ReservationOffer`.
- **Anillo 2 — Operación y trazabilidad:** `ConditionReport`, `Incident`,
  `CopyStateTransition`, `AuditLog`, `Notification`, `Shipment`.
- **Anillo 3 — Configuración y pagos (simulados):** `Plan`, `SystemSetting`,
  `RetentionReminderConfig`, `PaymentMethod`, `Payment`, `Address`, `Theme`,
  `MediaAsset`.

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    USER ||--o{ ADDRESS : posee
    USER ||--o{ SUBSCRIPTION : contrata
    PLAN ||--o{ SUBSCRIPTION : define
    USER ||--o{ RENTAL : alquila
    SUBSCRIPTION |o--o{ RENTAL : cubre
    THEME ||--o{ THEME : "sub-tema"
    THEME ||--o{ SET : agrupa
    SET ||--o{ COPY : "tiene copias"
    COPY ||--o{ RENTAL : "se alquila en"
    SET ||--o{ RESERVATION_QUEUE_ENTRY : "cola de"
    USER ||--o{ RESERVATION_QUEUE_ENTRY : "espera en"
    RESERVATION_QUEUE_ENTRY ||--o{ RESERVATION_OFFER : genera
    COPY ||--o{ RESERVATION_OFFER : "se ofrece como"
    RESERVATION_OFFER |o--o| RENTAL : "al aceptar crea"
    COPY ||--o{ COPY_STATE_TRANSITION : "historia de estados"
    USER ||--o{ COPY_STATE_TRANSITION : "actor"
    COPY ||--o{ CONDITION_REPORT : documenta
    RENTAL |o--o{ CONDITION_REPORT : "entrega/inspección"
    USER ||--o{ CONDITION_REPORT : operador
    COPY ||--o{ INCIDENT : afecta
    RENTAL |o--o{ INCIDENT : origina
    USER ||--o{ INCIDENT : "reporta"
    USER ||--o{ INCIDENT : "atiende"
    USER ||--o{ NOTIFICATION : recibe
    USER ||--o{ AUDIT_LOG : "acción admin"
    RENTAL ||--o{ SHIPMENT : mueve
    USER ||--o{ SHIPMENT : "marca (operador)"
    USER ||--o{ PAYMENT_METHOD : "tarjeta simulada"
    USER ||--o{ PAYMENT : realiza
    SUBSCRIPTION |o--o{ PAYMENT : "cuota mensual"
    RENTAL |o--o{ PAYMENT : "alquiler puntual"
    PAYMENT_METHOD |o--o{ PAYMENT : usa
    SET ||--o| RETENTION_REMINDER_CONFIG : "recordatorios"
    USER ||--o{ RETENTION_REMINDER_CONFIG : "activa (admin)"
    USER ||--o{ SYSTEM_SETTING : actualiza

    USER {
        uuid id PK
        string email UK "not null"
        string passwordHash "not null"
        enum role "SUBSCRIBER|OPERATOR|ADMIN"
        string fullName
        bool isAdult "declaración mayoría edad"
        enum status "ACTIVE|SUSPENDED"
        timestamptz createdAt
    }
    ADDRESS {
        uuid id PK
        uuid userId FK
        string line1
        string city
        string postalCode
        string country
        bool isDefault
    }
    PLAN {
        uuid id PK
        enum code UK "BASIC|PREMIUM"
        decimal monthlyPrice "configurable"
        int maxSimultaneousSets "1|2"
        int queueBonus "bono cola PREMIUM"
        bool active
    }
    SUBSCRIPTION {
        uuid id PK
        uuid userId FK
        uuid planId FK
        enum status "ACTIVE|PAUSED|CANCELLED"
        timestamptz startedAt
        timestamptz cancelledAt
    }
    THEME {
        uuid id PK
        string name
        uuid parentId FK "auto-relación (Rebrickable)"
    }
    SET {
        uuid id PK
        uuid themeId FK
        string name
        int pieceCount
        string recommendedAge "curado a mano"
        string difficulty "curado a mano"
        decimal referenceValue "obligatorio p/publicar"
        bool restricted "sujeto a antigüedad mín."
        bool published
    }
    COPY {
        uuid id PK
        uuid setId FK
        enum state "INTAKE..BAJA (9 estados)"
        timestamptz acquiredAt
        timestamptz retiredAt
    }
    RENTAL {
        uuid id PK
        uuid copyId FK
        uuid userId FK
        uuid subscriptionId FK "null si puntual"
        enum type "SUBSCRIPTION|ONE_OFF"
        enum status "ACTIVE|RETURN_INITIATED|IN_INSPECTION|COMPLETED"
        json shippingAddress "snapshot inmutable"
        decimal price "solo puntual"
        timestamptz startedAt
        timestamptz completedAt
    }
    RESERVATION_QUEUE_ENTRY {
        uuid id PK
        uuid setId FK
        uuid userId FK
        enum status "WAITING|OFFERED|CONFIRMED|EXPIRED|LEFT"
        timestamptz enqueuedAt "entrada real (cruda)"
        int appliedBonus "bono de plan congelado al encolar"
        timestamptz effectiveEntryAt "= enqueuedAt − appliedBonus; inmutable (D11)"
        int priorityPenalty "tras caducar oferta"
    }
    RESERVATION_OFFER {
        uuid id PK
        uuid queueEntryId FK
        uuid copyId FK
        uuid rentalId FK "UK, null hasta aceptar"
        enum status "PENDING|ACCEPTED|REJECTED|EXPIRED"
        timestamptz windowExpiresAt
        timestamptz reminderSentAt
    }
    COPY_STATE_TRANSITION {
        uuid id PK
        uuid copyId FK
        uuid actorId FK
        enum fromState
        enum toState
        string reason
        timestamptz createdAt
    }
    CONDITION_REPORT {
        uuid id PK
        uuid copyId FK
        uuid rentalId FK "null en alta"
        uuid operatorId FK
        enum kind "DELIVERY|INSPECTION"
        json checklist
        enum result "OK|INCOMPLETE|DAMAGED"
        timestamptz createdAt
    }
    INCIDENT {
        uuid id PK
        uuid copyId FK
        uuid rentalId FK
        uuid reportedById FK
        uuid assignedToId FK
        enum type "DELIVERY_DISCREPANCY|INCOMPLETE|DAMAGE|LOSS"
        enum status "OPEN|IN_PROGRESS|RESOLVED"
        timestamptz createdAt
    }
    NOTIFICATION {
        uuid id PK
        uuid userId FK
        string type "QUEUE_TURN|OFFER_REMINDER|.."
        json payload
        timestamptz sentAt
        timestamptz readAt
    }
    AUDIT_LOG {
        uuid id PK
        uuid actorId FK
        string action
        string entityType
        uuid entityId
        json metadata
        timestamptz createdAt
    }
    SHIPMENT {
        uuid id PK
        uuid rentalId FK
        enum direction "OUTBOUND|RETURN"
        string status
        uuid markedByOperatorId FK
        timestamptz createdAt
    }
    PAYMENT_METHOD {
        uuid id PK
        uuid userId FK
        string brand
        string last4
        int expMonth
        int expYear
        bool isDefault
    }
    PAYMENT {
        uuid id PK
        uuid userId FK
        uuid subscriptionId FK
        uuid rentalId FK
        uuid paymentMethodId FK
        decimal amount
        enum kind "SUBSCRIPTION_MONTHLY|ONE_OFF_RENTAL"
        enum status "SIMULATED_PAID|FAILED"
    }
    RETENTION_REMINDER_CONFIG {
        uuid id PK
        uuid setId FK "UK (1:1 con Set)"
        bool enabled
        int cadenceDays
        uuid activatedByAdminId FK
    }
    SYSTEM_SETTING {
        string key PK
        json value
        uuid updatedById FK
        timestamptz updatedAt
    }
    MEDIA_ASSET {
        uuid id PK
        enum ownerType "SET|CONDITION_REPORT"
        uuid ownerId "referencia polimórfica (sin FK)"
        string url
        enum kind "BOX_PHOTO|CHECKLIST_PHOTO"
    }
```

> Nota: `MEDIA_ASSET` usa una referencia polimórfica (`ownerType` + `ownerId`)
> hacia `Set` o `ConditionReport`, por lo que no tiene FK de BD (integridad
> validada en la aplicación) y aparece sin arista en el diagrama.

### **3.2. Descripción de entidades principales:**

Claves: **PK** primaria, **FK** foránea, **UK** única. Todos los `id` son `uuid`
(`@default(uuid())`); los timestamps son `timestamptz`.

**Anillo 1 — Núcleo del circuito E2E**

| Entidad | Descripción | Atributos y relaciones clave |
|---|---|---|
| **User** | Cuenta única con rol; un solo modelo cubre suscriptor, operador y admin (no hay entidad `Employee` en el MVP). | `role` (SUBSCRIBER/OPERATOR/ADMIN), `email` **UK**, `isAdult`. 1—N con casi todas las entidades operativas. |
| **Set** | Modelo de catálogo (semilla Rebrickable). No publicable sin `referenceValue`. | `referenceValue` **not null**, `restricted`, `published`; FK `themeId`. 1—N con `Copy` y `ReservationQueueEntry`. |
| **Copy** | Unidad física concreta de un Set; portadora del estado del ciclo de vida (9 estados). | `state` (enum `CopyState`); FK `setId`. 1—N con `Rental`, `ConditionReport`, `Incident`, `CopyStateTransition`. |
| **Subscription** | Suscripción de un usuario a un plan. | `status` (ACTIVE/PAUSED/CANCELLED); FK `userId`, `planId`. |
| **Rental** | Alquiler de una copia por un usuario. `subscriptionId` nulo ⇒ alquiler puntual. | `type` (SUBSCRIPTION/ONE_OFF), `shippingAddress` (snapshot JSON inmutable), `price` (solo puntual); FK `copyId`, `userId`, `subscriptionId?`. 1—1 opcional con `ReservationOffer`. |
| **ReservationQueueEntry** | Entrada en la cola de un Set. Una cola por Set. | `effectiveEntryAt` **inmutable** (`enqueuedAt − appliedBonus`; orden sin recálculo, D11), `appliedBonus`, `priorityPenalty`, `status`; FK `setId`, `userId`. |
| **ReservationOffer** | Oferta de una copia al cabeza de cola dentro de la ventana de confirmación. Una entrada puede recibir varias ofertas. | `windowExpiresAt`, `status`; FK `queueEntryId`, `copyId`, `rentalId?` **UK**. |

**Anillo 2 — Operación y trazabilidad**

| Entidad | Descripción | Atributos y relaciones clave |
|---|---|---|
| **ConditionReport** | Registro de condición en la entrega (`DELIVERY`) o en la inspección de devolución (`INSPECTION`). | `kind`, `result` (OK/INCOMPLETE/DAMAGED), `checklist` (JSON); FK `copyId`, `rentalId?`, `operatorId`. |
| **Incident** | Discrepancia reportada por el suscriptor (sin imputársela) o copia incompleta/dañada/perdida detectada por operador. | `type`, `status`; FK `copyId`, `rentalId?`, `reportedById`, `assignedToId?`. |
| **CopyStateTransition** | Historia auditada del ciclo de vida de la copia ("quién/cuándo"). | `fromState`, `toState`; FK `copyId`, `actorId`. |
| **AuditLog** | Auditoría genérica de acciones administrativas (config, gestión de empleados). | `action`, `entityType`, `entityId`, `metadata`; FK `actorId`. |
| **Notification** | Aviso al suscriptor o al back-office dirigido por eventos de dominio. | `type`, `payload`, `readAt`; FK `userId`. |
| **Shipment** | Movimiento logístico simulado; lo marca un operador manualmente. | `direction` (OUTBOUND/RETURN); FK `rentalId`, `markedByOperatorId?`. |

**Anillo 3 — Configuración y pagos (simulados)**

| Entidad | Descripción | Atributos y relaciones clave |
|---|---|---|
| **Plan** | Plan de suscripción configurable. | `code` **UK** (BASIC/PREMIUM), `monthlyPrice`, `maxSimultaneousSets`, `queueBonus`. |
| **PaymentMethod** | Tarjeta simulada (tokenizada ficticia). | `brand`, `last4`, `exp*`; FK `userId`. |
| **Payment** | Cargo simulado: cuota mensual o alquiler puntual. | `kind`, `amount`, `status`; FK `userId`, `subscriptionId?`, `rentalId?`, `paymentMethodId?`. |
| **RetentionReminderConfig** | Activación por admin de recordatorios de retención de un Set (1:1 con `Set`). | `enabled`, `cadenceDays`; FK `setId` **UK**, `activatedByAdminId?`. |
| **SystemSetting** | Parámetros configurables (clave-valor): ventana de confirmación, cadencia, límite de colas, antigüedad mínima, bono premium. | `key` **PK**, `value` (JSON); FK `updatedById?`. |
| **Address** | Dirección de envío/contacto. `Rental` captura un snapshot, por lo que editar aquí solo afecta a envíos futuros. | `isDefault`; FK `userId`. |
| **Theme** | Tema del catálogo con jerarquía (auto-relación padre/hijo). | `parentId?` (auto-FK). 1—N con `Set`. |
| **MediaAsset** | Adjuntos (fotos). Referencia polimórfica a `Set` o `ConditionReport`. | `ownerType`, `ownerId` (sin FK de BD), `kind`. |

---

## 4. Especificación de la API

La API es REST pública (Route Handlers de Next.js en `app/api/*`), documentada en
**OpenAPI 3** y con validación **Zod**. Autenticación por **cookie de sesión** y
errores en formato **RFC 9457** (`application/problem+json` con `code` de dominio,
ver §2.5). Se muestran los tres endpoints que capturan los rasgos distintivos del
producto: unirse a una cola, confirmar una oferta y avanzar el ciclo de vida de una
copia.

```yaml
openapi: 3.0.3
info:
  title: Clickoteca API
  version: 0.1.0-mvp
components:
  responses:
    Problem:
      description: Error en formato RFC 9457 (Problem Details)
      content:
        application/problem+json:
          schema:
            type: object
            properties:
              type:   { type: string }
              title:  { type: string }
              status: { type: integer }
              detail: { type: string }
              instance: { type: string }
              code:
                type: string
                enum: [COPY_STATE_CONFLICT, QUEUE_LIMIT_EXCEEDED, OFFER_EXPIRED,
                       NOT_ELIGIBLE, VALIDATION_ERROR, UNAUTHENTICATED, FORBIDDEN,
                       NOT_FOUND, INTERNAL]
paths:

  /api/sets/{setId}/queue:
    post:
      summary: Unirse a la cola de reservas de un Set
      description: >
        El suscriptor autenticado y elegible se encola. Se congela el bono de plan
        (appliedBonus) y se calcula, una sola vez, effectiveEntryAt =
        enqueuedAt − appliedBonus (orden inmutable, D11).
      parameters:
        - name: setId
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        '201':
          description: Entrada de cola creada
          content:
            application/json:
              schema:
                type: object
                properties:
                  queueEntryId:     { type: string, format: uuid }
                  status:           { type: string, example: WAITING }
                  position:         { type: integer, example: 3 }
                  effectiveEntryAt: { type: string, format: date-time }
        '403': { $ref: '#/components/responses/Problem' }  # NOT_ELIGIBLE
        '409': { $ref: '#/components/responses/Problem' }  # QUEUE_LIMIT_EXCEEDED

  /api/offers/{offerId}/confirm:
    post:
      summary: Aceptar o rechazar una oferta dentro de la ventana de confirmación
      parameters:
        - name: offerId
          in: path
          required: true
          schema: { type: string, format: uuid }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [action]
              properties:
                action: { type: string, enum: [ACCEPT, REJECT] }
      responses:
        '200':
          description: Oferta resuelta
          content:
            application/json:
              schema:
                type: object
                properties:
                  offerStatus: { type: string, example: ACCEPTED }
                  rentalId:    { type: string, format: uuid, nullable: true }
        '410': { $ref: '#/components/responses/Problem' }  # OFFER_EXPIRED

  /api/copies/{copyId}/transitions:
    post:
      summary: Avanzar el estado de una copia en su ciclo de vida (back-office)
      description: >
        Operador/Admin. Solo se permiten las transiciones válidas de la máquina de
        estados; se guarda por compare-and-swap (D12) y se audita quién/cuándo.
      parameters:
        - name: copyId
          in: path
          required: true
          schema: { type: string, format: uuid }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [toState]
              properties:
                toState: { type: string, example: EN_HIGIENIZACION }
                reason:  { type: string }
      responses:
        '200':
          description: Transición aplicada
          content:
            application/json:
              schema:
                type: object
                properties:
                  copyId:    { type: string, format: uuid }
                  fromState: { type: string, example: EN_INSPECCION }
                  toState:   { type: string, example: EN_HIGIENIZACION }
        '403': { $ref: '#/components/responses/Problem' }  # FORBIDDEN (p.ej. BAJA solo admin)
        '409': { $ref: '#/components/responses/Problem' }  # COPY_STATE_CONFLICT
```

**Ejemplo — conflicto de transición (HTTP 409):**

```json
{
  "type": "https://clickoteca/errors/copy-state-conflict",
  "title": "Transición de estado no válida",
  "status": 409,
  "code": "COPY_STATE_CONFLICT",
  "detail": "La copia 405 ya no está EN_INSPECCION.",
  "instance": "/api/copies/405/transitions"
}
```

---

## 5. Historias de Usuario

Se seleccionan las tres que capturan los rasgos distintivos de Clickoteca (cola
justa, ventana de confirmación y doble paso operativo con registro de condición).
El catálogo completo está en `documents/user_stories.md` (HU-00..HU-17, en Gherkin).

**Historia de Usuario 1 — HU-04 · Unirse a la cola de reservas**

**Como** suscriptor que quiere un set sin copias libres, **quiero** unirme a su cola
con una prioridad justa **para** conseguir el set cuando se libere, sin que el dinero
pase por encima de la espera.

Criterios de aceptación:
- **Dado** un suscriptor elegible ante un Set sin copias, **cuando** acepta
  encolarse, **entonces** se crea su entrada con la marca de incorporación y su
  prioridad (antigüedad + bono de plan).
- **Dado** un PREMIUM y un BASIC encolados en el mismo instante, **cuando** se ordena
  la cola, **entonces** el PREMIUM va por delante por su bono fijo.
- **Dado** un BASIC que lleva esperando suficientes días, **cuando** su prioridad
  supera a la de un PREMIUM recién encolado, **entonces** el BASIC se ordena por
  delante (prioridad **aditiva**, nunca multiplicativa).
- **Dado** un usuario en su límite de colas simultáneas (configurable, por defecto 1),
  **cuando** intenta unirse a otra, **entonces** la acción es **rechazada**.

**Historia de Usuario 2 — HU-05 · Confirmar (o rechazar) una oferta de cola**

**Como** suscriptor al que le llega el turno, **quiero** aceptar o rechazar la copia
dentro de una ventana de confirmación **para** no perder mi sitio por descuido y
liberar el turno al instante si no la quiero.

Criterios de aceptación:
- **Dado** una oferta abierta, **cuando** la **acepta** dentro de la ventana,
  **entonces** se le asigna la copia (pasa a `ALQUILADA`) y abandona la cola.
- **Dado** una oferta abierta, **cuando** la **rechaza**, **entonces** pasa **de
  inmediato** al siguiente elegible, sin esperar al vencimiento.
- **Dado** que transcurre la **mitad** de la ventana sin respuesta, **cuando** el
  sistema lo detecta, **entonces** envía un **recordatorio**.
- **Dado** que la ventana **caduca**, **cuando** vence, **entonces** el suscriptor
  vuelve al **final** de la cola con prioridad reducida (no es expulsado) y la oferta
  pasa al siguiente elegible.

**Historia de Usuario 3 — HU-11 + HU-13 · Registro de condición y doble paso
inspección/higienización**

**Como** operador, **quiero** documentar el estado de la copia antes de enviarla y
tratar la higienización como paso separado tras una inspección OK **para** tener una
referencia auditable y que la copia vuelva limpia a circulación.

Criterios de aceptación:
- **Dado** una copia recién asignada pendiente de envío, **cuando** el operador
  prepara el envío, **entonces** se registra checklist/foto junto con el **operador y
  el instante** (auditoría).
- **Dado** una copia que **superó la inspección**, **cuando** el operador completa la
  higienización, **entonces** queda `DISPONIBLE`, **o** `OFRECIDA` si hay cola activa.
- **Dado** un Set con cola, **cuando** una copia queda lista, **entonces** se ofrece
  al cabeza de cola elegible — **nunca durante** la inspección, solo después.
- La higienización es un **paso separado y posterior** a la inspección (no se fusiona).

---

## 6. Tickets de Trabajo

Tickets derivados de las historias anteriores y de las tareas del cambio OpenSpec
(`openspec/changes/clickoteca-mvp/tasks.md`), uno por capa.

**Ticket 1 — Backend · Encolar suscriptor con entrada efectiva inmutable (HU-04, HU-17)**

- **Contexto:** implementar el caso de uso "unirse a la cola" con la política de
  orden **inmutable** (`design.md` D11): sin recálculo de score.
- **Tareas:**
  1. Endpoint `POST /api/sets/{setId}/queue` (Route Handler + validación Zod).
  2. Comprobar elegibilidad: suscripción activa, sin devolución bloqueante, bajo el
     límite de colas simultáneas → si falla, **403 `NOT_ELIGIBLE`** / **409
     `QUEUE_LIMIT_EXCEEDED`**.
  3. Congelar `appliedBonus` (bono de plan al encolar) y calcular **una sola vez**
     `effectiveEntryAt = enqueuedAt − appliedBonus`; persistir `ReservationQueueEntry`.
  4. Devolver posición calculada de forma *lazy* ordenando por `effectiveEntryAt`.
- **Criterios de aceptación:** los de HU-04 + HU-17; el orden relativo no cambia con
  el tiempo sin altas/bajas.
- **Definición de hecho:** tests de dominio de equidad (BASIC supera a PREMIUM tras
  espera suficiente) y de límite de colas en verde; endpoint documentado en OpenAPI.

**Ticket 2 — Frontend · Pantalla "Mis sets" con posición en cola (HU-06)**

- **Contexto:** vista del suscriptor con sets en préstamo, histórico y posición en
  cada cola activa, en el route group `app/(portal)/`.
- **Tareas:**
  1. Server Component que consume los casos de uso / API de alquileres y colas.
  2. Tres bloques: **en préstamo** (con acción "iniciar devolución"), **historial** y
     **colas activas** (posición + estado de oferta si la hay).
  3. Estados vacíos y de carga; responsive **mobile-first**; accesibilidad **WCAG 2.1
     AA** (navegación por teclado, textos localizados por `code` de error).
- **Criterios de aceptación:** los de HU-06; un suscriptor sin nada prestado ve
  estados vacíos correctos.
- **Definición de hecho:** render SSR verificado, auditoría de accesibilidad básica
  pasada, sin datos de back-office en el bundle del portal.

**Ticket 3 — Base de datos · Esquema Prisma de cola y ofertas (soporte de HU-04/HU-05)**

- **Contexto:** modelar la cola y las ofertas con la forma inmutable de D11 y la
  concurrencia por CAS de D12. *(Ya implementado en `backend/prisma/schema.prisma`.)*
- **Tareas:**
  1. `ReservationQueueEntry` con `enqueuedAt`, `appliedBonus`, `effectiveEntryAt`
     (inmutable), `priorityPenalty` y `status` (WAITING/OFFERED/CONFIRMED/EXPIRED/LEFT).
  2. `ReservationOffer` con `windowExpiresAt`, `reminderSentAt`, `status` y
     `rentalId` **UK** (null hasta aceptar).
  3. Índices para ordenar por Set + `effectiveEntryAt`; migración inicial.
- **Criterios de aceptación:** `npx prisma migrate dev` crea las tablas;
  `openspec validate clickoteca-mvp --strict` en verde.
- **Definición de hecho:** esquema revisado contra PRD §15 y specs `reservation-queue`.

---

## 7. Pull Requests

> El proyecto se ha desarrollado en un flujo **directo a la rama `project-xvm`**
> (proyecto personal), por lo que no hay Pull Requests formales en GitHub. A modo de
> trazabilidad se documentan los tres hitos de entrega principales (commits) que
> equivaldrían a sendas PRs.

**Pull Request 1 — Modelo de datos** (`7c37834`)
Esquema Prisma (20 modelos / 16 enums), PRD §15 (tres anillos de importancia +
diagramas ER + máquina de estados de la copia) y sincronización con las specs.

**Pull Request 2 — Arquitectura** (`7985b78`)
Hosting en VM única, concurrencia por CAS (D12), orden de cola inmutable (D11) y
contrato de errores RFC 9457. Incluye C4 (niveles 1–3) y ADR-0001/ADR-0002.

**Pull Request 3 — Cierre de arquitectura y stack** (`a5edc4b`)
Stack confirmado **Next.js full-stack** (front + API REST/OpenAPI), cierre de las
*Open questions* de arquitectura y reconciliación de las historias de usuario con la
cola inmutable.

