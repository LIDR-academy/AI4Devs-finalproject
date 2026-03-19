# Tech Stack - Adresles

> **Última actualización**: 2026-03-19  
> **Documento fuente**: [Adresles_Business.md - Fase 4](../../Adresles_Business.md#fase-4-diseño-de-alto-nivel)

---

## 🎯 Stack Tecnológico Completo

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20 LTS | Runtime JavaScript |
| **NestJS** | 10.x | Framework backend (DDD-friendly) |
| **TypeScript** | 5.x | Lenguaje principal |
| **Prisma** | 5.22.0 (pinned) | ORM para Supabase (PostgreSQL) |
| **AWS SDK** | 3.x | Cliente DynamoDB |
| **BullMQ** | 5.x | Sistema de colas (jobs asíncronos) |
| **Redis** | 7.x | Cache + Cola de trabajos |

**Decisión**: Ver [ADR-003: NestJS Backend](../architecture/003-nestjs-backend.md)

---

### Frontend

> **Nota**: El MVP implementa una única aplicación frontend (`apps/web-admin/`). La Chat App (`apps/web-chat/`) fue descartada del MVP; la simulación de conversaciones se integró directamente en el Dashboard Admin.

#### Dashboard Admin

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16.1.6 | Framework React SSR (App Router, Server Components) — puerto dev: **3001** |
| **React** | 19.2.3 | Librería UI |
| **TypeScript** | 5.x | Type safety |
| **TailwindCSS** | 4.x | Utility-first CSS (CSS-first con `@theme` en globals.css, sin `tailwind.config.ts`) |
| **Shadcn/ui** | Latest | Componentes UI accesibles (Radix UI) |
| **sonner** | 2.x | Toast notifications (`toast.success()` / `toast.error()`) |
| **date-fns** | 4.x | Formateo de fechas |
| **lucide-react** | Latest | Iconos |
| **cmdk** | 1.x | Combobox / command palette |
| **fetch nativo** | — | HTTP client (NO axios). Centralizado en `lib/api.ts` vía `apiFetch<T>()` |
| **EventSource nativo** | — | SSE para tiempo real (simulación de conversaciones) |
| **react-markdown** | 9.x | Renderizado Markdown en burbujas de chat (`MarkdownMessage`) |
| **remark-gfm** | 4.x | Plugin GFM: tablas, strikethrough, task lists |
| **remark-breaks** | 4.x | Plugin: convierte `\n` simples a `<br>` (imprescindible para mensajes del Worker) |

---

### Base de Datos

#### Supabase (PostgreSQL)

| Característica | Detalle |
|----------------|---------|
| **Propósito** | Datos relacionales (Users, Stores, Orders, Addresses) |
| **Versión PostgreSQL** | 15.x |
| **Features usados** | • Auth integrado<br>• Row Level Security (RLS)<br>• Realtime subscriptions<br>• Storage (futuro) |
| **ORM** | Prisma |

#### DynamoDB — Esquema Real Implementado

> **Nota**: El esquema implementado difiere del diseño original en `Adresles_Business.md`. Se usa una tabla única con claves simples y sin GSIs.

| Característica | Detalle |
|----------------|---------|
| **Propósito** | Mensajes de conversaciones + estado del Worker (alta volumetría) |
| **Tabla** | `adresles-messages` (local) / `adresles-messages-dev` (eu-west-1) / `adresles-messages-prod` (eu-central-1) |
| **Partition Key** | `conversationId` (UUID) |
| **Sort Key** | `messageId` — timestamp ISO 8601 para mensajes, `'__state__'` para estado del Worker |
| **TTL** | `expiresAt` — 90 días (DynamoDB borra automáticamente) |
| **Índices GSI** | Sin GSIs en el MVP — búsquedas por `order_id`/`user_phone` se hacen en PostgreSQL |
| **Nombre configurable** | `DYNAMODB_TABLE_NAME` en `.env` |

**Decisión**: Ver [ADR-002: Arquitectura DB Híbrida](../architecture/002-supabase-dynamodb.md) + [ADR-010: DynamoDB AWS Multi-entorno](../architecture/010-dynamodb-aws-multienv.md)

**Modelo completo**: Ver [Adresles_Business.md - Sección 3.2-3.3](../../Adresles_Business.md#32-modelo-entidad-relación)

---

### Servicios Externos

| Servicio | Propósito | Decisión ADR |
|----------|-----------|--------------|
| **OpenAI API** | Motor conversacional (`gpt-4o-mini`) | [ADR-004](../architecture/004-openai-gpt4.md) |
| **Google Maps API** | Validación + normalización de direcciones | Incluido en diseño inicial |
| **Supabase** | PostgreSQL managed + Auth | [ADR-002](../architecture/002-supabase-dynamodb.md) |
| **AWS DynamoDB** | NoSQL managed para mensajes | [ADR-002](../architecture/002-supabase-dynamodb.md) |

---

### Infraestructura y Deployment

#### Backend — AWS Lightsail (producción)

| Componente | Tecnología | Detalle |
|------------|------------|---------|
| **Compute** | AWS Lightsail `small_3_0` | Ubuntu 22.04, 2 GB RAM, $12/mes, IP estática `52.57.222.42` |
| **Containerización** | Docker 29 + Docker Compose v5 | Stack: api, worker, redis, caddy |
| **Reverse Proxy** | Caddy 2 (`caddy:2-alpine`) | HTTPS automático (Let's Encrypt), TLS 1.3 |
| **Container Registry** | AWS ECR (`eu-central-1`) | `adresles-api` + `adresles-worker` (privado) |
| **Process Manager** | Docker `restart: unless-stopped` | Alta disponibilidad automática |

#### CDN/Hosting Frontend

| Componente | Servicio | URL |
|------------|----------|-----|
| **Dashboard Admin** | Vercel (Free tier) | `simulator.adresles.com` |

#### DNS

| Subdominio | Tipo | Destino |
|---|---|---|
| `backend.adresles.com` | A | `52.57.222.42` (Lightsail) |
| `simulator.adresles.com` | CNAME | `cname.vercel-dns.com` (Vercel) |
| `adresles.com` | — | KonsoleH (WordPress, **sin modificar**) |

**ADR**: Ver [ADR-011: Docker + ECR + Lightsail + Caddy](../architecture/011-docker-ecr-lightsail-caddy.md)

---

### CI/CD

| Herramienta | Propósito |
|-------------|-----------|
| **GitHub Actions** | Pipeline CI/CD (`.github/workflows/deploy.yml`) |
| **AWS ECR** | Registry privado de imágenes Docker (`eu-central-1`) |
| **SSH Deploy** | Push a Lightsail → `docker compose pull` + `up -d` |

**Workflow** (push a `main`):
1. Login a ECR con credenciales `Cursor-Deployer`
2. Build + push imágenes API y Worker a ECR
3. SSH al servidor `52.57.222.42`
4. `docker compose pull` + `docker compose up -d`
5. `docker image prune -f`

**Secrets necesarios en GitHub**:
- `AWS_ACCOUNT_ID`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `LIGHTSAIL_HOST`, `LIGHTSAIL_SSH_KEY`

**Pipeline**: Ver [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml)

---

## 🏗️ Arquitectura de Carpetas

### Monorepo con pnpm + Turborepo

```
adresles/
├── apps/
│   ├── api/              # NestJS 10 — Backend modular (HTTP + SSE)
│   ├── worker/           # Node.js puro — BullMQ Worker (sin NestJS)
│   └── web-admin/        # Next.js 16 — Dashboard Admin (App Router)
│
├── packages/
│   ├── prisma-db/        # Schema Prisma 5.22.0 + client generado + migrations + seed
│   └── shared-types/     # Interfaces de colas (ProcessConversationJobData, etc.)
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml       # Dev local: Redis 7, DynamoDB-local (PostgreSQL vía Supabase)
│   │   ├── docker-compose.prod.yml  # Producción: api, worker, redis, caddy
│   │   └── Caddyfile                # Reverse proxy — backend.adresles.com HTTPS
│   └── scripts/
│
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD: ECR push + SSH deploy a Lightsail
├── apps/api/Dockerfile      # Multi-stage build (builder + runner Alpine)
├── apps/worker/Dockerfile   # Multi-stage build (builder + runner Alpine)
├── .env.prod.example        # Plantilla de variables de producción
└── .dockerignore            # Optimiza contexto Docker build
```

> **Importante**: El Worker (`apps/worker/`) es un proceso **Node.js puro** sin NestJS. Instancia directamente `Worker` de BullMQ, `PrismaClient` desde `@adresles/prisma-db` y el cliente de OpenAI.

**Detalle completo**: Ver [Adresles_Business.md - Sección 4.5](../../Adresles_Business.md#45-estructura-del-proyecto)

---

## 📦 Dependencias Clave

### Backend (NestJS)

```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/common": "^10.0.0",
  "@nestjs/config": "^3.0.0",
  "@prisma/client": "5.22.0",
  "bullmq": "^5.0.0",
  "ioredis": "^5.0.0",
  "class-validator": "^0.14.1",
  "class-transformer": "^0.5.1"
}
```

### Frontend Admin (Next.js)

```json
{
  "next": "16.1.6",
  "react": "19.2.3",
  "sonner": "^2.0.7",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.575.0",
  "cmdk": "^1.1.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.5.0",
  "class-variance-authority": "^0.7.1",
  "tailwindcss": "^4 (devDependency)",
  "react-markdown": "^9.x",
  "remark-gfm": "^4.x",
  "remark-breaks": "^4.x"
}
```

---

## 🔒 Seguridad

### Implementaciones de Seguridad

- ✅ **HTTPS** forzado (Caddy 2 + Let's Encrypt automático, TLS 1.3) — **en producción**
- ✅ **Input validation** (`class-validator` + `ValidationPipe` global con `whitelist` + `forbidNonWhitelisted`) — **en producción**
- ✅ **IAM mínimo privilegio** — DynamoDB: cada entorno tiene IAM User propio (`adresles-app-dev`, `adresles-app-prod`) con permisos limitados a `PutItem`, `GetItem`, `Query`, `UpdateItem` — **en producción**
- ✅ **Secrets management** (GitHub Secrets para CI/CD, `.env.prod` en servidor, archivos `.env.dev`/`.env.prod` no comiteados) — **en producción**
- ✅ **CORS** habilitado en `main.ts` — **en producción**
- 🔄 **Row Level Security (RLS)** en Supabase (multi-tenant) — **diseñado, post-MVP**
- 🔄 **API Key + Secret** para plugins eCommerce — **post-MVP**
- 🔄 **Webhook signatures** (validación HMAC) — **post-MVP**
- 🔄 **JWT tokens** (Supabase Auth) — **post-MVP**

**Detalle completo**: Ver [Adresles_Business.md - Sección 4.10](../../Adresles_Business.md#410-seguridad)

---

## 🧪 Testing

### Estrategia de Testing

| Tipo | Framework | Cobertura Objetivo |
|------|-----------|-------------------|
| **Unit Tests** | Jest | 80%+ |
| **Integration Tests** | Jest + Supertest | Endpoints críticos |
| **E2E Tests** | Playwright | Flujos principales |

### Testing del Backend

```typescript
// Jest + NestJS Testing utilities
import { Test, TestingModule } from '@nestjs/testing';
```

### Testing del Frontend

```typescript
// React Testing Library + Vitest
import { render, screen } from '@testing-library/react';
```

**Estándares completos**: Ver [Backend Standards - Testing](../../.cursor/rules/backend-standards.mdc)

---

## 🎨 Estándares de Código

### Linting y Formatting

| Herramienta | Configuración |
|-------------|---------------|
| **ESLint v9** | Configuración plana (`eslint.config.js`) con `@typescript-eslint` v8 |
| **Prettier** | 2 espacios, single quotes, trailing commas |
| **TypeScript** | `strict: true` |

### Git Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint"
    }
  }
}
```

**Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

---

## 📊 Monitorización (Futuro)

_Pendiente de implementación en fases posteriores_

Stack considerado:
- **Logs**: Loki + Grafana
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Alerting**: Grafana Alerts

---

## 🔗 Referencias

- **Documento completo**: [Adresles_Business.md - Fase 4](../../Adresles_Business.md#fase-4-diseño-de-alto-nivel)
- **Backend Standards**: [.cursor/rules/backend-standards.mdc](../../.cursor/rules/backend-standards.mdc)
- **ADRs relacionados**:
  - [ADR-002: DB Híbrida](../architecture/002-supabase-dynamodb.md)
  - [ADR-003: NestJS Backend](../architecture/003-nestjs-backend.md)
  - [ADR-004: OpenAI GPT-4o-mini](../architecture/004-openai-gpt4.md)
  - [ADR-010: DynamoDB AWS Multi-entorno](../architecture/010-dynamodb-aws-multienv.md)
  - [ADR-011: Docker + ECR + Lightsail + Caddy](../architecture/011-docker-ecr-lightsail-caddy.md)

---

**Última actualización**: 2026-03-19  
**Mantenido por**: Sergio  
**Versiones actualizadas**: Prisma 5.22.0 (pinned), BullMQ 5.x, ESLint 9.x, @typescript-eslint 8.x, Next.js 16.1.6, React 19.2.3, Tailwind 4.x, sonner 2.x, cmdk 1.x, react-markdown 9.x, remark-gfm 4.x, remark-breaks 4.x  
**Infraestructura producción**: AWS Lightsail + Caddy 2 + AWS ECR (`eu-central-1`); Vercel para frontend  
**Cambios 2026-03-19**: DynamoDB schema actualizado al real implementado (tabla única, sin GSIs, `messageId` como SK, `__state__`); seguridad diferenciada entre producción y post-MVP; fecha actualizada
