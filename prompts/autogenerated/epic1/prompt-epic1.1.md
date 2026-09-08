# Prompt 1 — Infrastructure & Database Scaffold

## Role
You are a senior full-stack TypeScript engineer specialised in project scaffolding, Hexagonal Architecture, and PostgreSQL schema design. You build clean, production-ready project foundations that developers can start coding business logic on immediately.

## Context
We are building a **Personal Training Management Platform** — a web application for a gym with 3 roles (Admin, Coach, Coachee).

Key domain facts:
- **Roles:** Admin (full control), Coach (creates/manages classes), Coachee (attends classes, mobile-first)
- **Core domain:** Individual classes (1 coachee, max 2 concurrent), Group classes (3-4 coachees, max 1 concurrent), Waiting lists (max 4), Recurring weekly series, Personal/Gym-wide time blocks, 12 notification types
- **Architecture:** Hexagonal (Ports & Adapters) — Express backend, React frontend, PostgreSQL via Prisma
- **Google Calendar:** Server-side only via Service Account (adapter stub for now)
- **Methodology:** SDD (Specification-Driven Development) — specs live in `spec/` directory

The project already has:
- `/docs/` directory with PRD, architecture, API specifications, epics, and user stories
- `/prompts/` directory with prompt history
- Root `.gitignore` with `.DS_Store`

## Objective
Create the complete **project infrastructure and database layer** for the Personal Training Management Platform. This is the foundation — no runtime backend code yet, just configuration, schema, and tooling.

## Requirements

### 1. Root Configuration Files

**File: `biome.json`** — Shared linter/formatter config (single config for backend + frontend):
- Line width: 100
- Indent: space, width 2
- Enabled: `organizeImports`
- JavaScript formatter: semicolons always, trailing commas "all", quote style "double"
- Linter rules: recommended ruleset, ban unused imports, no debugger

**File: `vitest.workspace.ts`** — Workspace config referencing backend:

```ts
import { defineWorkspace } from 'vitest/config';
export default defineWorkspace(['backend/vitest.config.ts']);
```

**File: `.env.example`** — All required environment variables with placeholder values:

```env
# App
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coacher

# Auth
JWT_SECRET=change-me-to-a-random-64-char-string
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Encryption (AES-256-GCM key for coach financial data)
COACH_FINANCIAL_ENCRYPTION_KEY=change-me-to-a-32-byte-hex-string

# Google Calendar (stub for now)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_CALENDAR_ID=

# Firebase Cloud Messaging (stub for now)
FCM_SERVER_KEY=
```

**File: `.gitignore`** (replace existing minimal one):

```
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
.prisma/
coverage/
```

### 2. Docker Compose

**File: `docker-compose.yml`** at repo root:

- **`db` service:**
  - Image: `postgres:16-alpine`
  - Port: `5432:5432`
  - Environment: POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres, POSTGRES_DB=coacher
  - Volume: named volume `pgdata` at /var/lib/postgresql/data
  - Health check: `pg_isready -U postgres`

- **`api` service:**
  - Build context: `./backend`
  - Port: `3001:3001`
  - Depends on: `db` (condition: service_healthy)
  - Environment file: `.env`
  - Command: `npx tsx watch src/index.ts`

### 3. Backend Dockerfile

**File: `backend/Dockerfile`:**

```
FROM node:22-alpine
WORKDIR /app
USER node
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3001
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1
CMD ["node", "dist/index.js"]
```

### 4. Backend package.json

**File: `backend/package.json`:**

```json
{
  "name": "coacher-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome check src/",
    "lint:fix": "biome check --write src/",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^6.2.1",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.1",
    "express-rate-limit": "^7.4.1",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "pino": "^9.5.0",
    "pino-http": "^10.3.0",
    "uuid": "^11.0.3",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.10.2",
    "@types/supertest": "^6.0.2",
    "@types/uuid": "^10.0.0",
    "prisma": "^6.2.1",
    "supertest": "^7.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8"
  }
}
```

> Note: Use caret ranges for flexibility. The PRD section 10.5 specifies exact pinning for production — this will be locked at release time.

### 5. Backend tsconfig.json

**File: `backend/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@domain/*": ["./src/domain/*"],
      "@application/*": ["./src/application/*"],
      "@infrastructure/*": ["./src/infrastructure/*"],
      "@config/*": ["./src/config/*"]
    },
    "baseUrl": "."
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 6. Backend Folder Structure

Create the following directories (these will receive actual files in Prompt 2):

```
backend/src/
  domain/
    entities/
    services/
  application/
    use-cases/
  infrastructure/
    adapters/
      repositories/
      auth/
      calendar/
      notifications/
    middleware/
    routes/
  config/
  __tests__/
```

### 7. Prisma Schema — All 9 Models

**File: `backend/prisma/schema.prisma`:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [uuid_ossp, citext]
}
```

#### Enums

```prisma
enum UserRole {
  ADMIN
  COACH
  COACHEE
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

enum ClassType {
  INDIVIDUAL
  GROUP
}

enum ClassStatus {
  ACTIVE
  CANCELED
}

enum BlockType {
  PERSONAL
  GYM_WIDE
}

enum ClassTypePreference {
  INDIVIDUAL
  GROUP
  BOTH
}
```

#### Model: User

```prisma
model User {
  id                   String   @id @default(uuid()) @db.Uuid
  email                String   @unique @db.Citext
  password_hash        String
  name                 String
  phone                String
  role                 UserRole
  status               UserStatus @default(ACTIVE)
  level_id             String?   @db.Uuid
  class_type_preference ClassTypePreference?
  bank_account         String?
  ssn                  String?
  dni                  String?
  additional_info      String?
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt

  level                Level?              @relation(fields: [level_id], references: [id])
  enrolledClasses      ClassEnrollment[]
  waitingLists         WaitingList[]
  createdClasses       TrainingClass[]     @relation("CreatedBy")
  assignedClasses      TrainingClass[]     @relation("AssignedCoach")
  createdBlocks        Block[]             @relation("BlockCreator")
  coachBlocks          Block[]             @relation("BlockedCoach")
  notifications        Notification[]
  refreshTokens        RefreshToken[]
}
```

#### Model: RefreshToken

Stores refresh tokens server-side as required by PRD section 10.1.

```prisma
model RefreshToken {
  id         String    @id @default(uuid()) @db.Uuid
  token_hash String    @unique
  user_id    String    @db.Uuid
  expires_at DateTime
  created_at DateTime  @default(now())
  revoked_at DateTime?

  user User @relation(fields: [user_id], references: [id])
}
```

#### Model: Level

```prisma
model Level {
  id         String @id @default(uuid()) @db.Uuid
  name       String @unique
  color      String
  sort_order Int

  users            User[]
  trainingClasses  TrainingClass[]
  recurrenceSeries RecurrenceSeries[]
}
```

#### Model: TrainingClass

```prisma
model TrainingClass {
  id                  String      @id @default(uuid()) @db.Uuid
  class_type          ClassType
  assigned_coach_id   String      @db.Uuid
  level_id            String?     @db.Uuid
  start_time          DateTime
  duration_minutes    Int
  status              ClassStatus @default(ACTIVE)
  description         String?
  recurrence_series_id String?    @db.Uuid
  google_event_id     String?
  created_by          String      @db.Uuid
  created_at          DateTime    @default(now())
  updated_at          DateTime    @updatedAt

  assignedCoach    User               @relation("AssignedCoach", fields: [assigned_coach_id], references: [id])
  createdBy        User               @relation("CreatedBy", fields: [created_by], references: [id])
  level            Level?             @relation(fields: [level_id], references: [id])
  recurrenceSeries RecurrenceSeries?  @relation(fields: [recurrence_series_id], references: [id])
  enrollments      ClassEnrollment[]
  waitingLists     WaitingList[]
  notifications    Notification[]
}
```

#### Model: ClassEnrollment

```prisma
model ClassEnrollment {
  id         String   @id @default(uuid()) @db.Uuid
  class_id   String   @db.Uuid
  coachee_id String   @db.Uuid
  joined_at  DateTime @default(now())

  class   TrainingClass @relation(fields: [class_id], references: [id])
  coachee User          @relation(fields: [coachee_id], references: [id])

  @@unique([class_id, coachee_id])
}
```

#### Model: WaitingList

```prisma
model WaitingList {
  id         String   @id @default(uuid()) @db.Uuid
  class_id   String   @db.Uuid
  coachee_id String   @db.Uuid
  joined_at  DateTime @default(now())

  class   TrainingClass @relation(fields: [class_id], references: [id])
  coachee User          @relation(fields: [coachee_id], references: [id])

  @@unique([class_id, coachee_id])
}
```

#### Model: RecurrenceSeries

```prisma
model RecurrenceSeries {
  id          String    @id @default(uuid()) @db.Uuid
  class_type  ClassType
  level_id    String?   @db.Uuid
  coach_id    String    @db.Uuid
  day_of_week Int
  start_time  DateTime
  start_date  DateTime
  created_by  String    @db.Uuid
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  level           Level?          @relation(fields: [level_id], references: [id])
  coach           User            @relation(fields: [coach_id], references: [id])
  createdBy       User            @relation("SeriesCreator", fields: [created_by], references: [id])
  trainingClasses TrainingClass[]
}
```

#### Model: Block

```prisma
model Block {
  id             String    @id @default(uuid()) @db.Uuid
  block_type     BlockType
  created_by     String    @db.Uuid
  coach_id       String?   @db.Uuid
  start_time     DateTime
  end_time       DateTime
  description    String?
  google_event_id String?
  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt

  createdBy User  @relation("BlockCreator", fields: [created_by], references: [id])
  coach     User? @relation("BlockedCoach", fields: [coach_id], references: [id])
}
```

#### Model: Notification

```prisma
model Notification {
  id                String    @id @default(uuid()) @db.Uuid
  notification_type Int
  recipient_id      String    @db.Uuid
  class_id          String?   @db.Uuid
  content           String
  is_read           Boolean   @default(false)
  sent_at           DateTime  @default(now())
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt

  recipient User             @relation(fields: [recipient_id], references: [id])
  class     TrainingClass?   @relation(fields: [class_id], references: [id])
}
```

### 8. Prisma Seed Script

**File: `backend/prisma/seed.ts`:**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const levels = [
  { name: "Principiante", color: "#4A90D9", sort_order: 1 },
  { name: "Basico", color: "#50C878", sort_order: 2 },
  { name: "Intermedio", color: "#F5A623", sort_order: 3 },
  { name: "Avanzado", color: "#E67E22", sort_order: 4 },
  { name: "Experto", color: "#E74C3C", sort_order: 5 },
];

async function main() {
  console.log("Seeding levels...");

  for (const level of levels) {
    const result = await prisma.level.upsert({
      where: { name: level.name },
      update: { color: level.color, sort_order: level.sort_order },
      create: level,
    });
    console.log(`Level "${result.name}" (${result.color}) — ${result.sort_order}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 9. spec/ Directory

Create `spec/` at repo root with an empty `.gitkeep` file. This directory holds SDD specification files (`.spec.md`) for each feature.

### 10. AGENTS.md

**File: `AGENTS.md`** at repo root — instructions for AI assistants working on this project:

```markdown
# Project Guide for AI Assistants

## Project
Personal Training Management Platform — a gym class scheduling app with 3 roles (Admin, Coach, Coachee).

## Tech Stack
- **Backend:** Node.js 22 LTS + TypeScript + Express + Prisma + PostgreSQL
- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS v4 + React Router v6 + TanStack React Query v5
- **Testing:** Vitest + Supertest (unit/integration), Playwright (E2E)
- **Infra:** Docker Compose, Render (deployment)
- **Tooling:** Biome (lint/format)

## Architecture: Hexagonal (Ports & Adapters)
- `src/domain/` — Pure entities + domain services (zero external deps)
- `src/application/` — Use case orchestrators
- `src/infrastructure/` — Adapters (Prisma repos, Express controllers, auth, calendar, FCM)
- `src/config/` — DI container, env config

## Key Conventions
1. All files in PascalCase for components/entities, camelCase for utilities
2. Class duration is ALWAYS 60 minutes
3. Gym capacity: max 2 individual + 1 group simultaneous
4. Google Calendar event titles: class type + level only (no PII)
5. Error responses: `{ error: { code, message, ref } }` — no stack traces
6. All dependencies pinned to EXACT versions (no ranges)
7. No raw SQL — Prisma parameterized queries only
8. API under `/api/v1/` prefix

## Linear MCP
This project uses Linear for issue tracking. Issue IDs follow pattern COACHER-N.
```

## Constraints
- Do NOT write any Express route handlers or middleware logic — that is for Prompt 2
- Do NOT write any React components — that is for Prompt 3
- Use `npm` as package manager (not pnpm, not yarn)
- All dependencies must be pinned to exact versions
- TypeScript strict mode enabled everywhere
- No raw SQL queries anywhere

## Output Expectations
After running `npm install` at the repo root and `docker compose up -d`, I should be able to:

1. `npx prisma migrate dev --schema=backend/prisma/schema.prisma` — creates all 9 tables
2. `npm run db:seed -w backend` — seeds 5 levels
3. `npx prisma studio --schema=backend/prisma/schema.prisma` — shows all models in Prisma Studio
4. Verify `backend/tsconfig.json` has correct path aliases configured
5. Verify all enums and relations are correctly defined in the schema

Do NOT leave anything as a TODO. Generate complete, working code for every file.
