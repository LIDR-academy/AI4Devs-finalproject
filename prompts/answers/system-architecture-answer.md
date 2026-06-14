## 1. Diagram Format Justification

**C4 Model** — I combine Context (personas), Container (SPA, API, DB), and Component (controllers, services, repositories) into a single view. This is the right fit because the project is in a pre-code planning stage: one diagram must communicate the system boundary, technology stack, and internal layering to stakeholders and future developers without requiring multiple pages.

---

## 2. Architecture Diagram

The diagram is written to `docs/architecture-diagram.md`. Here it is rendered:

[//]: # "Gordi Challenge — C4-inspired Architecture Diagram"

```mermaid
flowchart TB
    %% ── Styles ──
    classDef person fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef frontend fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef backend fill:#fce4ec,stroke:#c62828,stroke-width:2px,color:#b71c1c
    classDef domain fill:#fff3e0,stroke:#e65100,stroke-width:1px,color:#bf360c
    classDef data fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef infra fill:#e0e0e0,stroke:#424242,stroke-width:2px,color:#212121
    classDef external fill:#fff8e1,stroke:#f57f17,stroke-width:2px,color:#e65100

    %% ═══════════════════════ LEVEL 1: PERSONAS ═══════════════════════
    Admin(("👑 Admin")):::person
    Gordi(("👤 Gordi")):::person

    %% ═══════════════════════ LEVEL 2: CONTAINERS ═══════════════════════
    subgraph Frontend["── Frontend : React SPA (TypeScript + Vite) ──"]
        direction TB
        Router["React Router<br/><i>Client-side routing</i>"]:::frontend
        Pages["Pages<br/>Home · Profile · Challenge Detail<br/>Add Weight · Edit Profile"]:::frontend
        Charts["Charts (Recharts)<br/>Line · Multiline · Bar · Progress"]:::frontend
        State["State<br/>React Context + useReducer"]:::frontend
        API["API Client<br/>Axios + TanStack React Query"]:::frontend

        Router --> Pages
        Pages --> Charts
        Pages --> State
        Pages --> API
    end

    subgraph Backend["── Backend : Node.js REST API (Express + TypeScript) ──"]
        direction TB

        subgraph Middleware["Presentation"]
            AuthMW["JWT Middleware<br/><i>Token verification</i>"]:::backend
            ValidMW["Validation Middleware<br/><i>Zod / Joi schemas</i>"]:::backend
            ErrorMW["Error Handler<br/><i>Standardised JSON errors</i>"]:::backend
        end

        subgraph Controllers["Controllers (HTTP Adapters)"]
            AuthCtrl["Auth Controller<br/>register · login · refresh"]:::backend
            UserCtrl["User Controller<br/>profile · edit · stats"]:::backend
            ChallengeCtrl["Challenge Controller<br/>create · join · detail · ranking"]:::backend
            WeightCtrl["Weight Controller<br/>log entry · history"]:::backend
        end

        subgraph Services["Application Services"]
            AuthSvc["Auth Service<br/>password hashing · JWT issuance"]:::domain
            UserSvc["User Service<br/>profile management · BMI"]:::domain
            ChallengeSvc["Challenge Service<br/>CRUD · invite codes · rankings"]:::domain
            WeightSvc["Weight Service<br/>entries · trend regression"]:::domain
        end

        subgraph Domain["Domain Logic"]
            CalcSvc["Calculation Service<br/>BMI · % progress · trend line<br/>leaderboard sort · goal gap"]:::domain
        end

        subgraph Repositories["Persistence (Ports & Adapters)"]
            UserRepo["User Repository"]:::backend
            ChallengeRepo["Challenge Repository"]:::backend
            ParticipationRepo["Participation Repository"]:::backend
            WeightRepo["Weight Repository"]:::backend
        end
    end

    subgraph Data["── Data Layer ──"]
        direction LR
        ORM["Prisma ORM<br/>Migrations · Client · Typed queries"]:::data
        DB[("PostgreSQL<br/><i>Relational store</i>")]:::data
        ORM <--> DB
    end

    subgraph DevOps["── Infrastructure ──"]
        Docker["Docker + Compose<br/><i>Local dev containers</i>"]:::infra
        CI["GitHub Actions<br/>lint · typecheck · test · deploy"]:::infra
        Host["Cloud Host (Render / Railway)<br/>API + DB + static assets"]:::infra
    end

    %% ═══════════════════════ LEVEL 3: RELATIONSHIPS ═══════════════════════
    Admin    -->|"creates & joins challenges"| Frontend
    Gordi    -->|"joins & logs weight"| Frontend

    API     -->|"HTTP / JSON"| Backend
    Frontend --> API

    AuthMW  --> Controllers
    ValidMW --> Controllers
    ErrorMW --> Controllers

    Controllers --> Services
    Services   --> Domain
    Services   --> Repositories
    Domain     --> Repositories

    Repositories --> ORM

    Docker --> Host
    CI     --> Host
```

---

## 3. Pattern Selection

**Chosen pattern: Clean Architecture (Ports & Adapters / Hexagonal-inspired Layered Architecture)**  

This pattern divides the backend into four concentric layers — **Controllers** (HTTP adapters), **Application Services** (orchestration), **Domain** (pure business logic), and **Repositories** (persistence ports) — with all dependencies pointing inward toward the domain. It fits because **Gordi Challenge has non-trivial domain rules** (BMI calculation, linear-regression trend prediction, invite-code generation, leaderboard sort, weekly-entry constraints) that must remain independent of frameworks, the HTTP protocol, and the database. The application is data-centric with clear CRUD surfaces, so a layered structure with a rich domain core prevents business logic from leaking into Express route handlers or Prisma queries. For a solo/small-team academic project, Clean Architecture provides just enough structure without the overhead of CQRS or event-driven patterns, and it maps directly to the project's future testability needs (domain logic can be unit-tested without mocks).

---

## 4. Benefits

- **Domain logic is framework-agnostic** — `CalculationService` computes BMI, trend lines, and rankings using pure functions with no Express or Prisma imports. It can be unit-tested in isolation and reused if a future API version (GraphQL, gRPC) replaces REST.
- **Invite-code and weekly-entry rules are enforced in one place** — The `ChallengeService` owns invite-code uniqueness and the `WeightService` enforces the one-entry-per-Monday constraint, not scattered across controllers or SQL triggers. Changing the invite-code format from 6-character alphanumeric to 8-character hex only touches one file.
- **HTTP layer is thin and swappable** — Controllers do nothing but parse requests, call a service, and format responses. If the project later needs a BFF for a mobile app, the existing services and repositories remain untouched.
- **Repository abstraction enables database-agnostic testing** — Repositories implement interfaces (ports) that can be swapped for in-memory stores during integration tests, avoiding the need for a real PostgreSQL instance in CI for most test runs.
- **Frontend separation of concerns** — TanStack React Query manages server-state caching and background refetching, while React Context handles UI state (active challenge filter, modals). Charts are isolated in a `Charts` module using Recharts, which simplifies replacing the charting library later if the wireframe requirements evolve.
- **TypeScript across the stack** — Shared types for API payloads (generated from Prisma schema) eliminate runtime mismatches between frontend DTO expectations and backend responses.

---

## 5. Trade-offs and Pain Points

- **Repository layer adds indirection for simple CRUD** — For basic "find user by ID" or "insert weight entry", the Repository interface adds a file and a boilerplate method that calls Prisma directly with nearly identical syntax. **Acceptable for MVP** — the indirection cost is low, and it pays off as soon as you add caching, audit logging, or switch databases. Could revisit by using Prisma's generated client directly if the team finds the abstraction burdensome.
- **Domain service separation can feel excessive at small scale** — `CalculationService` could be a static method on the `User` entity, but Clean Architecture pushes for stateless domain services to keep entities anemic (data-only). This is a stylistic trade-off; the current choice prioritises testability over pure DDD purity.
- **No event-driven communication** — Weight entries don't emit events, so updating the leaderboard is a synchronous call inside the controller. If the app grows (e.g., email notifications on new rankings), you would need to introduce an event bus or message queue. **Acceptable for v1** — synchronous updates are simpler and sufficient for the current scale.
- **React Context + useReducer over a state-management library** — This avoids the dependency weight of Redux or Zustand but may become unwieldy if the profile and challenge detail pages share deeply nested state. **Mitigation: keep UI state local to pages; React Query handles all server state.**
- **PostgreSQL + Prisma for a small dataset** — A lighter option (SQLite) would simplify local setup, but the PRD explicitly requires relational integrity (foreign keys, unique codes, GDPR compliance). Prisma's migration tooling and type generation offset the operational overhead.
- **No infrastructure-as-code for deployment** — Docker Compose covers local dev, but production provisioning is manual (Render/Railway dashboard). For a solo academic project this is pragmatic; a team project should adopt Terraform or Pulumi before the first production deployment.