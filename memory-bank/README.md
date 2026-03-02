# Memory Bank - Adresles

> **Contexto persistente del proyecto para sesiones de IA**  
> **Última actualización**: 2026-03-02  
> ✅ **Change completado**: infra-prisma-shared-schema — `packages/prisma-db` (Opción B, ADR-009), schema+migraciones+seed centralizados, `@adresles/prisma-db` en dependencies

## 📖 Inicio Rápido

**¿Primera vez aquí?** Lee en orden:

1. **[Project Overview](./project-context/overview.md)** - Qué es Adresles (síntesis ejecutiva)
2. **[Tech Stack](./project-context/tech-stack.md)** - Tecnologías y versiones
3. **[Domain Glossary](./project-context/domain-glossary.md)** - Vocabulario del dominio

## 🏗️ Decisiones Arquitecturales (ADRs)

Decisiones clave que guían el desarrollo del proyecto:

| ID | Título | Estado | Fecha |
|----|--------|--------|-------|
| [001](./architecture/001-monolith-modular.md) | Monolito Modular vs Microservicios | ✅ Aceptada | 2026-01-30 |
| [002](./architecture/002-supabase-dynamodb.md) | Arquitectura DB Híbrida (Supabase + DynamoDB) | ✅ Aceptada | 2026-01-30 |
| [003](./architecture/003-nestjs-backend.md) | NestJS como Framework Backend | ✅ Aceptada | 2026-01-30 |
| [004](./architecture/004-openai-gpt4.md) | OpenAI GPT-4 para Conversaciones | ✅ Aceptada | 2026-01-30 |
| [005](./architecture/005-bullmq-worker-conversations.md) | BullMQ + Worker Dedicado para Conversaciones IA | ✅ Aceptada | 2026-02-21 |
| [006](./architecture/006-sse-redis-pubsub.md) | SSE + Redis Pub/Sub para Notificaciones Real-Time | ✅ Aceptada | 2026-02-27 |
| [007](./architecture/007-shared-types-package.md) | `packages/shared-types` — Fuente Única de Tipos Compartidos | ✅ Aceptada | 2026-02-28 |
| [008](./architecture/008-prisma-schema-worker-opcion-c.md) | Worker apunta al schema Prisma del API (Opción C, stepping stone) | ✅ Aceptada | 2026-03-02 |
| [009](./architecture/009-prisma-db-package.md) | `packages/prisma-db` — Fuente Única del Schema Prisma (Opción B) | ✅ Aceptada | 2026-03-02 |

## 🎨 Patrones y Convenciones

| Archivo | Descripción | Última actualización |
|---------|-------------|---------------------|
| [validation-patterns.md](./patterns/validation-patterns.md) | DTOs con `class-validator`, Query/Body/Nested, `ValidationPipe`, tests de controller con `supertest` | 2026-02-28 |
| [real-time-sse-patterns.md](./patterns/real-time-sse-patterns.md) | SSE con NestJS, Redis Pub/Sub con `ioredis`, `psubscribe`, RxJS `Subject`; `EventSource` con URL absoluta en Next.js | 2026-03-01 |
| [frontend-form-patterns.md](./patterns/frontend-form-patterns.md) | Formulario-modal con `useState` local, `canSubmit` derivado, mapeo `line1`/`line2` → `street`/`full_address`, combobox con estado derivado, `safeTimeLabel`, `key` prop reset | 2026-03-01 |
| [prisma-shared-package-patterns.md](./patterns/prisma-shared-package-patterns.md) | Schema+migraciones+seed en `packages/prisma-db`, `dependencies` vs devDependencies, `db:seed` desde root, shadow DB y checksum | 2026-03-02 |

Pendiente de documentar:
- Límites de agregados DDD
- Estrategia de manejo de errores
- Convenciones de API REST

## 📚 Referencias Externas

### Documentación Principal

- **[Adresles_Business.md](../Adresles_Business.md)** (2170 líneas - v1.3)  
  Documento completo de diseño del sistema (Fases 1-4)  
  **v1.3**: Casos de Uso actualizados para MVP Mock

- **[Backend Standards](../openspec/specs/backend-standards.mdc)** (1230 líneas)  
  Estándares técnicos, DDD, SOLID, testing

- **[Data Model](../openspec/specs/data-model.md)**  
  Modelo de datos detallado

### Índices de Navegación

- **[Business Doc Map](./references/business-doc-map.md)**  
  Mapa navegable del documento de negocio por temas

### Archivos de Changes

- **[openspec/changes/archive/](../openspec/changes/archive/)**  
  Historial de cambios completados e implementados

## 📝 Sesiones Pasadas

| Fecha | Sesión | Estado |
|-------|--------|--------|
| [2026-02-18](./sessions/2026-02-18-cu01-progreso.md) | CU-01 Procesar Compra Mock — Progreso inicial | ✅ Supersedida |
| [2026-02-21](./sessions/2026-02-21-cu01-procesar-compra-mock.md) | CU-01 Procesar Compra Mock — Completado | ✅ Completado (23/23 tareas) |
| [2026-02-23](./sessions/2026-02-23-cu02-frontend-admin.md) | CU-02 Frontend Admin Dashboard — Completado | ✅ Completado (40/40 tareas) |
| [2026-02-24](./sessions/2026-02-24-t01-orders-sorting.md) | T01 — Ordenación de Columnas en Pedidos — Completado | ✅ Completado (30/30 tareas) |
| [2026-02-25](./sessions/2026-02-25-t02-orders-filters.md) | T02 — Filtros y Búsqueda en Tabla de Pedidos — Completado | ✅ Completado (34/34 tareas) |
| [2026-02-26](./sessions/2026-02-26-t03-users-sorting-filters.md) | T03 — Ordenación y Filtros en Tabla de Usuarios — Completado | ✅ Completado (27/27 tareas) |
| [2026-02-27](./sessions/2026-02-27-cu03-a1-stores-endpoint.md) | CU03-A1 — Endpoint GET /api/admin/stores — Completado | ✅ Completado (15/15 tareas) |
| [2026-02-27](./sessions/2026-02-27-cu03-a2-sse-infrastructure.md) | CU03-A2 — Infraestructura SSE Real-Time — Completado | ✅ Completado (35/35 tareas) |
| [2026-02-28](./sessions/2026-02-28-cu03-a3-mock-dto-extension.md) | CU03-A3 — Extensión DTO Mock con Campos eCommerce — Completado | ✅ Completado (29/29 tareas) |
| [2026-02-28](./sessions/2026-02-28-cu03-a4-simulate-layout.md) | CU03-A4 — Layout /simulate y enlace en Sidebar — Completado | ✅ Completado (17/17 tareas) |
| [2026-02-28](./sessions/2026-02-28-cu03-a5-order-config-modal.md) | CU03-A5 — Modal de Configuración de Pedido — Completado | ✅ Completado (26/26 tareas + S1/S2/S3) |
| [2026-03-01](./sessions/2026-03-01-cu03-a6-simulation-chat.md) | CU03-A6 — Chat de Simulación SSE en Tiempo Real — Completado | ✅ Completado (22/22 tareas) |
| [2026-03-02](./sessions/2026-03-02-cu03-b1-worker-db-sync.md) | CU03-B1 — Worker DB Sync: StatusSource + Schema Compartido — Completado | ✅ Completado (30/30 tareas) |
| [2026-03-02](./sessions/2026-03-02-infra-prisma-shared-schema.md) | infra-prisma-shared-schema — packages/prisma-db (Opción B, ADR-009) — Completado | ✅ Completado (19/19 tareas) |

**Próximo change**: siguiente CU03 o nuevo change según prioridad.

## 🔄 Flujo de Trabajo

### Durante una Sesión de Desarrollo

1. **Contexto inicial**: Lee `README.md` y `project-context/overview.md`
2. **Consulta decisiones**: Revisa ADRs relacionados con tu tarea
3. **Trabaja con OpenSpec**: Usa `/opsx:new` o `/opsx:continue` para cambios
4. **Aplica patrones**: Sigue convenciones documentadas en `patterns/`

### Después de una Sesión (Post-trabajo manual, 2-5 min)

**Solo si aplica**:
- ✅ Nueva decisión arquitectural → Crea ADR en `architecture/`
- ✅ Patrón emergente importante → Documenta en `patterns/`
- ✅ Aprendizaje significativo → Registra en `sessions/`

## 📊 Estructura de Carpetas

```
memory-bank/
├── README.md                   # Este archivo (índice maestro)
│
├── project-context/            # Contexto general del proyecto
│   ├── overview.md            # Síntesis ejecutiva de Adresles
│   ├── tech-stack.md          # Stack tecnológico
│   └── domain-glossary.md     # Glosario del dominio
│
├── architecture/               # Decisiones arquitecturales (ADRs)
│   ├── _template.md           # Plantilla para nuevos ADRs
│   ├── 001-monolith-modular.md
│   ├── 002-supabase-dynamodb.md
│   ├── 003-nestjs-backend.md
│   ├── 004-openai-gpt4.md
│   ├── 005-bullmq-worker-conversations.md
│   ├── 006-sse-redis-pubsub.md
│   ├── 007-shared-types-package.md
│   ├── 008-prisma-schema-worker-opcion-c.md
│   └── 009-prisma-db-package.md
│
├── patterns/                   # Patrones y convenciones
│   ├── validation-patterns.md       # DTOs, class-validator, supertest
│   ├── real-time-sse-patterns.md    # SSE, Redis Pub/Sub, RxJS
│   ├── frontend-form-patterns.md   # Formularios modal, dirección eCommerce, combobox
│   └── prisma-shared-package-patterns.md  # Schema+migraciones+seed en packages/prisma-db
│
├── sessions/                   # Aprendizajes de sesiones pasadas
│   └── (se documenta conforme avanza el proyecto)
│
└── references/                 # Índices y mapas de navegación
    └── business-doc-map.md    # Navegación temática del Business.md
```

## 🎯 Propósito del Memory-Bank

Este memory-bank permite a la IA:

✅ **Mantener contexto entre sesiones cortas** sin re-explicar el proyecto  
✅ **Acceder rápidamente a decisiones clave** (ADRs de ~100 líneas vs doc de 2130)  
✅ **Entender el "por qué"** detrás de las decisiones técnicas  
✅ **Seguir patrones establecidos** consistentemente  
✅ **Referenciar documentación detallada** cuando sea necesario

## 📖 Documentación Complementaria

### Para Desarrollo con OpenSpec

- Workflow SDD: Ver skills en `.cursor/skills/openspec-*`
- Comandos disponibles: `/opsx:new`, `/opsx:continue`, `/opsx:apply`, `/opsx:archive`

### Para Estándares Técnicos

- Backend: `openspec/specs/backend-standards.mdc`
- Frontend: `openspec/specs/frontend-standards.mdc`
- Base: `openspec/specs/base-standards.mdc`

---

**Última revisión**: 2026-03-02  
**Mantenido por**: Sergio (desarrollo individual)  
**Cambios recientes**: infra-prisma-shared-schema completado — `packages/prisma-db` (ADR-009), schema+migraciones+seed centralizados, `@adresles/prisma-db` en dependencies, `db:seed` desde root. Patrón prisma-shared-package-patterns y sesión documentados.  
**Evoluciona con**: Cada decisión arquitectural o patrón significativo
