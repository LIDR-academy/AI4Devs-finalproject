# System Architecture — Personal Training Management Platform

## 1. Recommended Diagram Format

**C4 Model (Context + Container) combinado con un diagrama hexagonal (Ports & Adapters) para el backend.** El C4 muestra el ecosistema completo (personas, frontend, backend, Google Calendar, FCM). El diagrama hexagonal interno del backend revela cómo se cumple el mandato de Clean Architecture del PRD. Se elige C4 porque el proyecto está en etapa pre-code: un solo diagrama debe comunicar el límite del sistema, el stack tecnológico y la estructura interna a stakeholders y futuros desarrolladores sin requerir múltiples páginas.

## 2. Architectural Pattern

**Clean / Hexagonal Architecture (Ports & Adapters)** — mandatado explícitamente por la Sección 8 del PRD. Justificación:

- **Google Calendar como sistema de registro** requiere un adaptador reemplazable. Si mañana migran a Outlook Calendar, solo cambia el adapter, no el dominio. Además, Google Calendar se accede exclusivamente server-side mediante una Service Account con un calendario privado de sistema — ningún usuario humano lo ve ni lo toca, eliminando la necesidad de sincronización bidireccional.
- **Reglas de negocio complejas** (capacidad del gym: 2 individuales + 1 grupal simultáneo, waiting lists con notificación simultánea first-come-first-served, reach de niveles, recurrencia semanal, validación de overlaps) viven en el dominio, testables sin infraestructura.
- **UI condicional por rol** (Admin/Coach/Coachee) en un mismo frontend: un patrón de componentes con layout-switching según rol, con lógica de negocio cero en el cliente.
- **Mobile-first + PWA** para Coachee implica separar concerns de UI (componentes Coachee) del resto.

## 3. Architecture Diagram

```mermaid
flowchart TB
    %% ── Styles ──
    classDef person fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef frontend fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef inbound fill:#c8e6c9,stroke:#2e7d32,stroke-width:1px,color:#1b5e20
    classDef app fill:#fff3e0,stroke:#e65100,stroke-width:1px,color:#bf360c
    classDef domain fill:#fce4ec,stroke:#c62828,stroke-width:2px,color:#b71c1c
    classDef port fill:#e1bee7,stroke:#6a1b9a,stroke-width:1px,stroke-dasharray:6 3,color:#4a148c
    classDef outbound fill:#ffe0b2,stroke:#e65100,stroke-width:1px,color:#bf360c
    classDef infra fill:#e0e0e0,stroke:#424242,stroke-width:2px,color:#212121
    classDef external fill:#fff8e1,stroke:#f57f17,stroke-width:2px,color:#e65100

    %% ═══════════════════ LEVEL 1: PERSONAS ═══════════════════
    Admin(("👑 Admin")):::person
    Coach(("🏋️ Coach")):::person
    Coachee(("📱 Coachee")):::person

    %% ═══════════════════ LEVEL 2: FRONTEND ═══════════════════
    subgraph Frontend["── Frontend: React SPA + PWA (TypeScript + Vite) ──"]
        direction TB
        Router["React Router<br/><i>Role-based layout switching</i>"]:::frontend

        subgraph Views["Role Views"]
            AdminUI["Admin Views<br/>Today · Calendar · Coachees · Coaches"]:::frontend
            CoachUI["Coach Views<br/>Today · Calendar · Coachees"]:::frontend
            CoacheeUI["Coachee Views<br/>Home · Calendar · Notifications"]:::frontend
        end

        CalendarUI["Calendar UI<br/><i>Custom component (no Google Calendar API in browser)</i>"]:::frontend
        State["State<br/>React Context + useReducer"]:::frontend
        ApiClient["API Client<br/>Axios + TanStack React Query"]:::frontend
        SW["Service Worker<br/>PWA install · Push notifications"]:::frontend

        Router --> AdminUI
        Router --> CoachUI
        Router --> CoacheeUI
        AdminUI --> CalendarUI
        CoachUI --> CalendarUI
        CoacheeUI --> CalendarUI
        CalendarUI --> State
        State --> ApiClient
    end

    %% ═══════════════════ LEVEL 2: BACKEND — HEXAGONAL ═══════════════════
    subgraph Backend["── Backend: Node.js REST API (Hexagonal Architecture) ──"]

        %% ── Inbound adapters ──
        subgraph Inbound["Inbound Adapters (Driving)"]
            MW["Middleware<br/>JWT Auth · Role guard<br/>Validation (Zod) · Error handler"]:::inbound
            Controllers["Controllers<br/>Class / Coach / Coachee / Block / Auth"]:::inbound
            MW --> Controllers
        end

        %% ── Application ports & services ──
        subgraph AppPorts["Application Ports (Use Case Interfaces)"]
            ScheduleClass["ScheduleClassUseCase"]:::port
            CancelClass["CancelClassUseCase"]:::port
            JoinWaitlist["JoinWaitingListUseCase"]:::port
            ManageBlock["ManageBlockUseCase"]:::port
        end

        Controllers --> ScheduleClass
        Controllers --> CancelClass
        Controllers --> JoinWaitlist
        Controllers --> ManageBlock

        subgraph AppServices["Application Services (Orchestration)"]
            ProcessWaitlist["ProcessWaitingListService<br/><i>Called after cancellation</i>"]:::app
            NotifySvc["SendNotificationService<br/><i>Called by any use case</i>"]:::app
        end

        CancelClass --> ProcessWaitlist
        ScheduleClass --> NotifySvc
        CancelClass --> NotifySvc
        JoinWaitlist --> NotifySvc
        ManageBlock --> NotifySvc

        %% ── Domain ──
        subgraph Domain["Domain Layer (Pure Business Logic)"]
            Entities["Entities<br/>Class · Coachee · Coach · WaitingList<br/>Block · Level · Notification"]:::domain
            Services["Domain Services<br/>CapacityValidator · OverlapChecker<br/>ReachCalculator · WaitlistEngine<br/>RecurrenceGenerator"]:::domain
            Entities --> Services
        end

        ScheduleClass --> Services
        CancelClass --> Services
        JoinWaitlist --> Services
        ProcessWaitlist --> Services
        ManageBlock --> Services
        NotifySvc --> Services

        %% ── Outbound ports ──
        subgraph OutPorts["Outbound Ports (Driven Interfaces)"]
            ClassRepoPort["ClassRepository"]:::port
            UserRepoPort["UserRepository"]:::port
            WaitlistRepoPort["WaitingListRepository"]:::port
            CalendarPort["CalendarProvider"]:::port
            NotificationPort["NotificationSender"]:::port
        end

        Services --> ClassRepoPort
        Services --> UserRepoPort
        Services --> WaitlistRepoPort
        Services --> CalendarPort
        Services --> NotificationPort

        %% ── Outbound adapters ──
        subgraph Outbound["Outbound Adapters (Driven)"]
            ClassRepo["PostgresClassRepository"]:::outbound
            UserRepo["PostgresUserRepository"]:::outbound
            WaitlistRepo["PostgresWaitingListRepository"]:::outbound
            CalendarAdapter["GoogleCalendarAdapter<br/><i>Service Account OAuth2<br/>Events CRUD · free/busy</i>"]:::outbound
            NotifAdapter["FCMNotificationAdapter<br/><i>Push via Firebase</i>"]:::outbound
        end

        ClassRepoPort --> ClassRepo
        UserRepoPort --> UserRepo
        WaitlistRepoPort --> WaitlistRepo
        CalendarPort --> CalendarAdapter
        NotificationPort --> NotifAdapter
    end

    %% ═══════════════════ INFRASTRUCTURE ═══════════════════
    subgraph Data["── Data Layer ──"]
        direction LR
        ORM["Prisma ORM"]:::infra
        DB[("PostgreSQL")]:::infra
        ORM <--> DB
    end

    subgraph External["── External Services ──"]
        GCAL[("Google Calendar API<br/>Private system calendar<br/><i>Service Account —<br/>no user has access</i>")]:::external
        FCM[("Firebase Cloud Messaging<br/><i>Push notifications</i>")]:::external
    end

    %% ═══════════════════ RELATIONSHIPS ═══════════════════
    Admin    -->|"Desktop web"| Frontend
    Coach    -->|"Desktop web"| Frontend
    Coachee  -->|"Mobile-first PWA"| Frontend

    ApiClient -->|"HTTP/JSON · JWT"| MW

    ClassRepo --> ORM
    UserRepo --> ORM
    WaitlistRepo --> ORM

    CalendarAdapter -->|"REST · OAuth2 (Service Account)"| GCAL
    NotifAdapter -->|"HTTP v1 API"| FCM

    SW -.->|"Push events"| FCM
```

### Data Flow — Calendario

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant GC as Google Calendar API

    Note over F,GC: Lectura: renderizar calendario
    F->>B: GET /calendar
    B->>GC: GET free/busy
    GC-->>B: Events list
    B->>F: Clases + bloques (datos combinados)

    Note over F,GC: Escritura: crear clase
    F->>B: POST /class
    B->>GC: POST event
    GC-->>B: Event ID + status
    B->>F: Class creada (con event_id)
```

## 4. Component Inventory

| Componente | Capa Arquitectónica | Rol |
|-----------|---------------------|-----|
| **Frontend SPA** | Interface de usuario | UI con renderizado condicional por rol (Admin/Coach/Coachee); mobile-first para Coachee |
| **Calendar UI** | Interface de usuario | Componente custom de calendario — nunca llama a Google Calendar API directamente |
| **PWA Layer** | Interface de usuario | Service Worker para instalación "Add to Home Screen" + push notifications |
| **Backend API** | Aplicación | REST API con arquitectura hexagonal; toda la lógica de negocio |
| **Domain Layer** | Dominio | Entidades puras + domain services sin dependencias externas |
| **Database** | Persistencia | Datos relacionales: usuarios, enrolamientos, waiting lists, notificaciones, referencias a eventos de Google Calendar |
| **Google Calendar Adapter** | Infraestructura (outbound) | Adaptador de salida: Google Calendar como motor de scheduling interno vía Service Account con calendario privado |
| **Notification Adapter** | Infraestructura (outbound) | Push notifications a los 3 roles |
| **Auth** | Infraestructura (cross) | JWT stateless con RBAC |

## 5. Benefits

- **Google Calendar es reemplazable**: el `CalendarProvider` port permite intercambiar Google Calendar por Outlook, iCal o un calendario custom sin tocar una línea de dominio.
- **Sin riesgo de desincronización bidireccional**: al usar una Service Account con calendario privado, ningún usuario puede modificar eventos fuera de la plataforma. No hay conflictos de edición externa.
- **Reglas de negocio testables en aislamiento**: `CapacityValidator`, `OverlapChecker`, `ReachCalculator` son funciones puras sin IO. Se testean en milisegundos sin mocks.
- **Waiting list engine aislado**: la lógica de notificación simultánea first-come-first-served con límite de 4 está en el dominio. Se puede unit-testear cada escenario (PRD Sección 7).
- **UI por rol sin duplicación**: un solo frontend con layout-switching basado en rol. Componentes compartidos (Calendar, Notifications bell) reutilizados; vistas específicas por rol en módulos separados.
- **Notificaciones como puerto**: los 12 eventos (PRD Sección 7) se disparan desde el dominio a través del port `NotificationSender`. Se pueden agregar canales (email, SMS) sin cambiar la lógica de negocio.
- **PWA installability limpia**: el Service Worker está desacoplado del resto del frontend, solo maneja cacheo y push events.

## 6. Trade-offs / Pains

- **Google Calendar como motor interno añade latencia**: toda operación de schedule requiere RTT a Google Calendar API. Si la API está caída o rate-limitada, el sistema no puede crear clases ni bloques. Se necesita un cache layer o fallback.
- **Disponibilidad de time slots**: Google Calendar free/busy es costoso de consultar en tiempo real. El modal de "Add Class" necesita surfear slots disponibles sin degradar la experiencia. Posible bottleneck.
- **Service Account management**: requiere gestionar credenciales de Service Account (rotación de keys, permisos, cuotas de API de Google). Es infraestructura adicional que un equipo pequeño debe mantener.
- **Calendario invisible para el usuario**: al no haber un calendario visible fuera de la plataforma, los Coachees no recuerdan sus clases con notificaciones del calendario de Google. Toda la recordación recae en las push notifications de la app.
- **Boilerplate de puertos y adaptadores**: cada caso de uso requiere interface + implementación + inyección de dependencias. Para CRUD simple (ej. listar coachees) es indirección pura.
- **Overhead cognitivo del equipo**: desarrolladores no familiarizados con Hexagonal Architecture pueden sentirse abrumados por las capas. Requiere disciplina mantener el dominio limpio.
- **Testing E2E con dependencia externa**: Google Calendar API y FCM son externos. Los tests E2E necesitan mocks/sandboxes para no depender de servicios reales en CI.

## 7. Google Calendar Integration — Detalle Técnico

### Arquitectura de Conexión

El backend se conecta a Google Calendar API usando una **Service Account** de Google Cloud:

1. Se crea un proyecto en Google Cloud Console.
2. Se habilita Google Calendar API.
3. Se crea una Service Account con un calendario privado (no es un calendario de usuario).
4. El backend usa `google-auth-library` para generar un JWT firmado con la private key de la Service Account y obtener un access token (OAuth2 server-to-server).
5. Todas las llamadas a la API de Google Calendar usan ese token.

### ¿Qué se almacena en Google Calendar vs PostgreSQL?

| Datos | Google Calendar | PostgreSQL |
|-------|----------------|------------|
| Evento de clase (título, hora, duración) | ✅ | ✅ (event_id de referencia) |
| Coachees asignados | ❌ | ✅ |
| Waiting list | ❌ | ✅ |
| Nivel de la clase | ❌ | ✅ |
| Coach asignado | ❌ | ✅ |
| Bloque personal / gym-wide | ✅ | ✅ |
| Notificaciones enviadas | ❌ | ✅ |

Google Calendar es el **system of record para horarios y disponibilidad** (free/busy). PostgreSQL es el system of record para todo lo demás (usuarios, enrolamientos, waiting lists, niveles, notificaciones).

---

## 8. Tech Stack & Development Methodology

### 8.1 Frontend

| Categoría | Elección | Por qué |
|-----------|----------|---------|
| **Framework** | React 18+ con TypeScript | Ecosistema maduro, tipado fuerte, hiring pool amplio para un frontender. |
| **Build tool** | Vite | HMR rápido, TypeScript/JSX nativo, configuración mínima. |
| **Routing** | React Router v6 | Estándar para React SPAs; nested layouts para las vistas por rol. |
| **Server state** | TanStack React Query v5 | Caching, background refetch, optimistic updates — elimina boilerplate de estado del servidor. |
| **UI state** | React Context + `useReducer` | State local por página; ningún store global necesario a esta escala. |
| **Calendar** | Componente custom (React) | Sin dependencia directa de Google Calendar API en el browser. Datos vía backend. |
| **Styling** | TailwindCSS v4 | Utility-first, estilos colocalizados, responsive sin archivos CSS separados. |
| **PWA** | vite-plugin-pwa (Workbox) | Service Worker automático, manifiesto, precaching, manejo de push events. |
| **Linting & formatting** | **Biomejs** | Un solo tool reemplaza ESLint + Prettier. Más rápido, menos archivos de configuración, soporte nativo de TypeScript. |

### 8.2 Backend

| Categoría | Elección | Por qué |
|-----------|----------|---------|
| **Runtime** | Node.js 22 LTS con TypeScript | Full-stack TypeScript reduce context-switching. LTS garantiza estabilidad para producción. |
| **HTTP framework** | Express (vs Fastify) | Express es más conocido, ecosistema enorme, curvas de aprendizaje más suave. Fastify es más rápido pero para esta escala no hay diferencia perceptible. Express gana por adoptabilidad del equipo. |
| **Validation** | Zod | Schemas que generan tipos TypeScript automáticamente — se usa en controllers y DTOs compartidos. |
| **ORM** | Prisma | Schema declarativo → cliente TypeScript autogenerado + migrations. Mapea 1:1 con las entidades del dominio. |
| **Auth** | `jsonwebtoken` + `bcrypt` | JWT stateless (access + refresh tokens); bcrypt para hash de passwords. |
| **Google Calendar** | `google-auth-library` + REST API v3 | Autenticación Service Account (JWT grant), llamado a la API de Calendar para CRUD de eventos y free/busy. |
| **Push notifications** | Firebase Admin SDK (FCM) | Envío de push notifications a dispositivos (web PWA y mobile). |
| **Linting & formatting** | **Biomejs** | Misma tool que el frontend — un solo `biome.json` en la raíz del repo. |
| **Testing unitario/integración** | Vitest + Supertest | Mismo runner que el frontend para consistencia. |

### 8.3 Database

| Categoría | Elección | Por qué |
|-----------|----------|---------|
| **Database** | PostgreSQL 16 | Integridad referencial (FKs, unique constraints para waiting lists), soporte JSONB si se necesita después, production-grade. |
| **Hosting** | Managed PostgreSQL (Neon, Supabase o Render) | Backup automatizado, SSL, point-in-time recovery. Reduce operaciones. |

### 8.4 Testing & Calidad

| Categoría | Elección | Por qué |
|-----------|----------|---------|
| **Unit / integration** | Vitest | Rápido, compatible con Vite, mismo runner frontend y backend. |
| **E2E** | **Playwright** | Confiable, multi-browser, test runner y assertions integrados, ejecución paralela. Mejor opción para flujos críticos: crear clase, waiting list, cancelación, notificaciones. Cypress es alternativa válida pero Playwright es más rápido en CI y tiene mejor soporte de mobile (emulación de dispositivos). |
| **CI/CD** | GitHub Actions | Lint (`biome check`), typecheck (`tsc --noEmit`), test (`vitest run`), build, y deploy en cada PR y push a `main`. |

### 8.5 API Documentation

| Categoría | Elección | Por qué |
|-----------|----------|---------|
| **Spec format** | OpenAPI 3.1 (YAML) | Estándar de la industria; describe cada endpoint, request/response schema y códigos de error. |
| **Doc platform** | **Mintlify** | Consume specs de OpenAPI y renderiza una referencia searchable y developer-friendly. Soporta páginas en Markdown para guías (getting started, auth flow, calendar lifecycle). |
| **CI publish** | GitHub Action → Mintlify | Auto-deploy de la doc en cada merge a `main` para que esté siempre sincronizada con la API. |

### 8.6 Project Management & Methodology

| Categoría | Elección | Por qué |
|-----------|----------|---------|
| **Issue tracking** | **Linear** | Rápido, keyboard-first, se integra con GitHub. Ideal para trackear epics, stories y bugs mapeados a las screens del PRD. |
| **Methodology** | **SDD (Specification-Driven Development)** con **Speckit** | Cada feature arranca con un spec estructurado (`.spec.md`) que define acceptance criteria, escenarios (Given/When/Then) y edge cases. Los specs son el input para AI LLMs (Claude, GPT-4) que generan el primer pase de código y tests. El frontender refina a partir de ahí. Los specs son la source of truth — todo cambio de requisito se refleja primero en el spec. |
| **AI assistance** | LLMs (Claude, GPT-4) via Speckit y prompting directo | Los specs son el contrato. AI genera el primer pase de implementación y tests. Todo cambio pasa por version control y review manual del frontender. |

### 8.7 Infrastructure & DevOps

| Categoría | Elección | Por qué |
|-----------|----------|---------|
| **Containerisation** | Docker + Docker Compose | Tres servicios: `api` (Node.js), `db` (PostgreSQL), y opcionalmente `frontend` (Vite dev server o build estático). Elimina "works on my machine". |
| **Production host** | **Render** (recomendado) | Plataforma unificada: despliega la API de Node.js como Web Service, PostgreSQL como managed DB, y el build de Vite como Static Site o detrás del mismo servicio. Free tier para staging, paid para producción. Alternativas: **Railway** (config más simple), **Fly.io** (edge regions globales). |
| **E2E en CI** | Playwright on GitHub Actions | Corre contra preview deployment o entorno Docker Compose. Bloquea merge si falla. |
| **Consideraciones de prod** | Environment variables via dashboard (nunca commitear `.env`). Secrets gestionados con GitHub Actions secrets + variables de entorno del host. Health check endpoint (`GET /health`). Rate limiting via `express-rate-limit`. CORS configurado para el dominio de producción del frontend. |

### 8.8 Estructura de proyecto recomendada

```
personal-training-platform/
├── spec/                        # SDD specs (.spec.md)
├── docs/                        # Mintlify content + OpenAPI spec
├── frontend/                    # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── pages/               # Una carpeta por rol (admin/, coach/, coachee/)
│   │   ├── components/          # UI compartida (calendar, forms, modals)
│   │   ├── api/                 # React Query hooks + Axios client
│   │   ├── context/             # React Context providers
│   │   └── types/               # Tipos TypeScript compartidos
│   ├── e2e/                     # Playwright tests
│   └── public/                  # PWA manifest, service worker, icons
├── backend/
│   ├── src/
│   │   ├── domain/              # Entidades puras + domain services
│   │   ├── application/         # Use cases / application services
│   │   ├── infrastructure/      # Adapters (controllers, repos, calendar, notifications)
│   │   └── config/              # DI container, env config
│   └── prisma/
│       ├── schema.prisma        # Data model
│       └── migrations/          # Auto-generadas
├── docker-compose.yml           # api + db + frontend para dev local
├── biome.json                   # Config única de lint/format
├── vitest.workspace.ts          # Config de tests compartida
└── .github/
    └── workflows/
        └── ci.yml               # Lint → typecheck → test → build → deploy
```

---

## 9. Data Structure

### Entity Legend

- **User** — Persona del sistema con rol (Admin/Coach/Coachee), contiene campos específicos según el rol y referencias al nivel asignado (Coachee).
- **Level** — Los 5 niveles definidos (Principiante, Básico, Intermedio, Avanzado, Experto) con su color y orden.
- **Class** — Una clase (individual o grupal) dictada por un Coach, con hora fija de 1 hora, estado, y referencia opcional a una serie recurrente.
- **ClassEnrollment** — Relación muchos-a-muchos entre Coachees y clases grupales, o uno-a-uno para clases individuales.
- **WaitingList** — Entrada de un Coachee en la lista de espera de una clase (grupal o individual).
- **RecurrenceSeries** — Definición de una serie semanal recurrente: tipo de clase, Coach, nivel, día y hora. Genera instancias de Class.
- **Block** — Bloqueo de tiempo (Personal: un Coach/Admin se bloquea a sí mismo; Gym-wide: el Admin bloquea todo el gimnasio).
- **Notification** — Una de las 12 notificaciones push catalogadas, dirigida a un Usuario, opcionalmente vinculada a una clase.

### Entity-Relationship Diagram

```mermaid
erDiagram
    User {
        uuid id PK
        string email "Unique login identifier, UK"
        string password_hash "bcrypt hash, never plaintext"
        string name
        string phone
        string role "admin, coach, coachee"
        string status "active, inactive"
        uuid level_id FK "Coachee level, nullable"
        string class_type_preference "individual, group, both, nullable"
        string bank_account "Coach only, nullable"
        string ssn "Coach only, nullable"
        string dni "Coach only, nullable"
        text additional_info "Coach only, nullable"
        datetime created_at
        datetime updated_at
    }
    Level {
        uuid id PK
        string name "Principiante, Basico, Intermedio, Avanzado, Experto, UK"
        string color "Hex color code, design TBD"
        int sort_order "1 to 5, ascending"
    }
    TrainingClass {
        uuid id PK
        string class_type "individual, group"
        uuid assigned_coach_id FK "Coach assigned to this class"
        uuid level_id FK "Group class level, nullable for individual"
        datetime start_time
        int duration_minutes "Always 60 (fixed by PRD)"
        string status "active, canceled"
        text description
        uuid recurrence_series_id FK "Nullable, links to series if recurring"
        string google_event_id "Google Calendar event reference"
        uuid created_by FK "User who created the class"
        datetime created_at
        datetime updated_at
    }
    ClassEnrollment {
        uuid id PK
        uuid class_id FK
        uuid coachee_id FK "References User where role=coachee"
        datetime joined_at
    }
    WaitingList {
        uuid id PK
        uuid class_id FK
        uuid coachee_id FK "References User where role=coachee"
        datetime joined_at
    }
    RecurrenceSeries {
        uuid id PK
        string class_type "individual, group"
        uuid level_id FK "Nullable for individual series"
        uuid coach_id FK "Default assigned coach for each instance"
        int day_of_week "0=Sunday, 1=Monday..."
        time start_time
        date start_date "First occurrence"
        uuid created_by FK
        datetime created_at
    }
    Block {
        uuid id PK
        string block_type "personal, gym-wide"
        uuid created_by FK "Admin or Coach who created it"
        uuid coach_id FK "Nullable; for personal blocks, who is blocked"
        datetime start_time
        datetime end_time
        string status "active, canceled"
        text description
        string google_event_id "Google Calendar event reference"
        datetime created_at
    }
    Notification {
        uuid id PK
        int notification_type "1 to 12, maps to PRD Section 7 catalog"
        uuid recipient_id FK "References User"
        uuid class_id FK "Nullable; null for non-class events"
        text content "Rendered push notification text"
        bool is_read
        datetime sent_at
        datetime created_at
    }

    Level ||--o{ User : "assigns level"
    Level ||--o{ TrainingClass : "class level"
    Level ||--o{ RecurrenceSeries : "series level"
    User ||--o{ TrainingClass : "assigned as coach"
    User ||--o{ TrainingClass : "created by"
    User ||--o{ ClassEnrollment : "enrolled as coachee"
    User ||--o{ WaitingList : "on waiting list"
    User ||--o{ Block : "created block"
    User ||--o{ Block : "blocked coach"
    User ||--o{ Notification : "receives notification"
    TrainingClass ||--o{ ClassEnrollment : "has enrollments"
    TrainingClass ||--o{ WaitingList : "has waiting list entries"
    TrainingClass ||--o{ Notification : "triggers notifications"
    RecurrenceSeries ||--o{ TrainingClass : "generates instances"
```