# Tech Stack - Adresles

> **Última actualización**: 2026-02-07  
> **Documento fuente**: [Adresles_Business.md - Fase 4](../../Adresles_Business.md#fase-4-diseño-de-alto-nivel)

---

## 🎯 Stack Tecnológico Completo

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20 LTS | Runtime JavaScript |
| **NestJS** | 10.x | Framework backend (DDD-friendly) |
| **TypeScript** | 5.x | Lenguaje principal |
| **Prisma** | 5.x | ORM para Supabase (PostgreSQL) |
| **AWS SDK** | 3.x | Cliente DynamoDB |
| **BullMQ** | 4.x | Sistema de colas (jobs asíncronos) |
| **Redis** | 7.x | Cache + Cola de trabajos |

**Decisión**: Ver [ADR-003: NestJS Backend](../architecture/003-nestjs-backend.md)

---

### Frontend

#### Chat App (Aplicación Usuario)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.x | Librería UI |
| **Vite** | 5.x | Build tool & dev server |
| **TypeScript** | 5.x | Type safety |
| **TanStack Query** | 5.x | Data fetching & cache |
| **Zustand** | 4.x | State management |
| **Socket.io Client** | 4.x | Real-time messaging |

#### Dashboard Admin

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.x | Framework React SSR |
| **TypeScript** | 5.x | Type safety |
| **TailwindCSS** | 3.x | Utility-first CSS |
| **Shadcn/ui** | Latest | Componentes UI |

---

### Base de Datos

#### Supabase (PostgreSQL)

| Característica | Detalle |
|----------------|---------|
| **Propósito** | Datos relacionales (Users, Stores, Orders, Addresses) |
| **Versión PostgreSQL** | 15.x |
| **Features usados** | • Auth integrado<br>• Row Level Security (RLS)<br>• Realtime subscriptions<br>• Storage (futuro) |
| **ORM** | Prisma |

#### DynamoDB

| Característica | Detalle |
|----------------|---------|
| **Propósito** | Mensajes de conversaciones (alta volumetría) |
| **Partition Key** | `conversation_id` |
| **Sort Key** | `timestamp` |
| **Índices GSI** | • `user_id-timestamp-index`<br>• `order_id-timestamp-index` |

**Decisión**: Ver [ADR-002: Arquitectura DB Híbrida](../architecture/002-supabase-dynamodb.md)

**Modelo completo**: Ver [Adresles_Business.md - Sección 3.2-3.3](../../Adresles_Business.md#32-modelo-entidad-relación)

---

### Servicios Externos

| Servicio | Propósito | Decisión ADR |
|----------|-----------|--------------|
| **OpenAI API** | Motor conversacional GPT-4 | [ADR-004](../architecture/004-openai-gpt4.md) |
| **Google Maps API** | Validación + normalización de direcciones | Incluido en diseño inicial |
| **Supabase** | PostgreSQL managed + Auth | [ADR-002](../architecture/002-supabase-dynamodb.md) |
| **AWS DynamoDB** | NoSQL managed para mensajes | [ADR-002](../architecture/002-supabase-dynamodb.md) |

---

### Infraestructura y Deployment

#### Servidor Dedicado (Konsole H)

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Containerización** | Docker + Docker Compose | Orquestación de servicios |
| **Reverse Proxy** | Traefik | Routing + SSL automático (Let's Encrypt) |
| **Process Manager** | Docker (restart policies) | Gestión de procesos |
| **Logs** | Docker logs | Centralización de logs |

#### CDN/Hosting Frontend

| Componente | Servicio | Propósito |
|------------|----------|-----------|
| **Dashboard Admin** | Vercel | Hosting Next.js (Free tier) |
| **Chat App** | Nginx en servidor dedicado | SPA estático servido |

**Detalle completo**: Ver [Adresles_Business.md - Sección 4.6](../../Adresles_Business.md#46-diagrama-de-infraestructura-y-deployment)

---

### CI/CD

| Herramienta | Propósito |
|-------------|-----------|
| **GitHub Actions** | Pipeline CI/CD |
| **Docker Registry** | DockerHub (imágenes) |
| **SSH Deploy** | Deployment al servidor dedicado |

**Workflow**:
1. Push a `main` → Trigger GitHub Actions
2. Run tests (Jest + Playwright)
3. Build Docker images
4. Push to DockerHub
5. SSH al servidor → Pull images → Restart containers

**Pipeline completo**: Ver [Adresles_Business.md - Sección 4.9](../../Adresles_Business.md#49-cicd-pipeline-github-actions)

---

## 🏗️ Arquitectura de Carpetas

### Monorepo con pnpm + Turborepo

```
adresles/
├── apps/
│   ├── api/              # NestJS Backend
│   ├── worker/           # BullMQ Worker
│   ├── web-chat/         # React Chat App (Vite)
│   └── web-admin/        # Next.js Dashboard
│
├── packages/
│   ├── shared-types/     # Types compartidos
│   └── api-client/       # Cliente API generado
│
├── infrastructure/
│   ├── docker/
│   │   └── docker-compose.yml
│   └── scripts/
│
└── .github/
    └── workflows/
```

**Detalle completo**: Ver [Adresles_Business.md - Sección 4.5](../../Adresles_Business.md#45-estructura-del-proyecto)

---

## 📦 Dependencias Clave

### Backend (NestJS)

```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/common": "^10.0.0",
  "@nestjs/config": "^3.0.0",
  "@prisma/client": "^5.0.0",
  "aws-sdk": "^3.0.0",
  "bullmq": "^4.0.0",
  "ioredis": "^5.0.0",
  "openai": "^4.0.0",
  "@googlemaps/google-maps-services-js": "^3.0.0"
}
```

### Frontend Chat (React + Vite)

```json
{
  "react": "^18.0.0",
  "vite": "^5.0.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.0.0",
  "socket.io-client": "^4.0.0"
}
```

### Frontend Admin (Next.js)

```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "tailwindcss": "^3.0.0",
  "@radix-ui/react-*": "^1.0.0"
}
```

---

## 🔒 Seguridad

### Implementaciones de Seguridad

- ✅ **Row Level Security (RLS)** en Supabase (multi-tenant)
- ✅ **API Key + Secret** para plugins eCommerce
- ✅ **Webhook signatures** (validación HMAC)
- ✅ **JWT tokens** (Supabase Auth)
- ✅ **HTTPS** forzado (Traefik + Let's Encrypt)
- ✅ **Rate limiting** (Redis + middleware)
- ✅ **Input validation** (class-validator + Zod)
- ✅ **Secrets management** (GitHub Secrets + env vars)

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

**Estándares completos**: Ver [Backend Standards - Testing](../../openspec/specs/backend-standards.mdc)

---

## 🎨 Estándares de Código

### Linting y Formatting

| Herramienta | Configuración |
|-------------|---------------|
| **ESLint** | `@typescript-eslint/recommended` |
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
- **Backend Standards**: [openspec/specs/backend-standards.mdc](../../openspec/specs/backend-standards.mdc)
- **ADRs relacionados**:
  - [ADR-002: DB Híbrida](../architecture/002-supabase-dynamodb.md)
  - [ADR-003: NestJS Backend](../architecture/003-nestjs-backend.md)
  - [ADR-004: OpenAI GPT-4](../architecture/004-openai-gpt4.md)

---

**Última actualización**: 2026-02-07  
**Mantenido por**: Sergio  
**Versiones actualizadas**: Conforme evoluciona el proyecto
