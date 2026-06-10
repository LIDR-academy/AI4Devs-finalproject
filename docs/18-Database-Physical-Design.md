# EventFlow — Database Physical Design Document

> Documento formal de Diseño Físico de Base de Datos del MVP
> Versión: 1.0
> Idioma: Español LATAM neutral
> Audiencia: Backend Engineer, Database Architect, DevOps, QA, agentes IA generadores de `prisma/schema.prisma`, migraciones, seeds, repositorios y pruebas de integración.
> Documentos fuente: 1 al 17 (ver §3).

---

## 1. Propósito del documento

Este documento define la **traducción concreta** del Modelo de Datos del Dominio de EventFlow (`/docs/6-Domain-Data-Model.md`) y de las decisiones técnicas posteriores (Backend, API, IA/PromptOps, NFR, Seed) en un **diseño físico implementable en PostgreSQL gestionado mediante Prisma ORM**.

Responde a cinco preguntas operativas:

1. ¿Cómo se materializan las entidades MVP como tablas PostgreSQL?
2. ¿Qué tipos físicos, constraints, enums e índices son requeridos?
3. ¿Cómo se persisten la trazabilidad IA, el ciclo de vida human-in-the-loop, el soft delete, la auditoría y la seed data?
4. ¿Qué patrones de migración Prisma se aplican?
5. ¿Qué patrones transaccionales y de concurrencia debe respetar el backend?

El documento es **implementation-ready**: cada decisión está trazada a los documentos fuente y es directamente derivable a `prisma/schema.prisma`, migraciones, scripts de seed, repositorios y suites de prueba.

---

## 2. Alcance del documento

### 2.1 Incluye

- Catálogo físico de tablas MVP (PostgreSQL).
- Tipos físicos por columna (`uuid`, `text`, `numeric`, `timestamptz`, `jsonb`, enums nativos).
- Convenciones de naming (tablas, columnas, enums, índices, constraints, migraciones).
- Estrategia de IDs (UUID v4), timestamps y auditoría.
- Constraints (PK, FK, unique parciales, check), enums e índices query-driven.
- Diseño físico de persistencia IA (`ai_recommendations`, `ai_prompt_versions`) y PromptOps.
- Estrategia JSONB y human-in-the-loop.
- Soft delete, seed (`is_seed`) y auditoría administrativa.
- Estrategia Prisma (mapping `@map`, `@@map`, `@@index`, `@@unique`, `Decimal`, `Json`).
- Estrategia de migraciones, rollback y compatibilidad con backfills.
- Consistencia transaccional y concurrencia (acoplada a `prisma.$transaction`).
- Consideraciones de seguridad, privacidad y performance MVP.
- Matriz de trazabilidad y checklist de readiness.

### 2.2 No incluye

- Selección de proveedor cloud (RDS, Cloud SQL, Supabase): es una decisión de despliegue.
- DDL final línea-a-línea: este documento guía la generación pero no la sustituye.
- Estrategia formal de backups y disaster recovery (cubierta por NFR + DevOps).
- Particionado, sharding, réplicas de lectura (out of scope MVP).
- Vector stores, embeddings, RAG (out of scope IA MVP).
- Schema multi-tenant (no aplica al MVP).
- Procedimientos almacenados, triggers o materialized views (no requeridos).

---

## 3. Fuentes utilizadas

| # | Documento fuente | Influencia sobre el diseño físico |
|---:|---|---|
| 1 | `/docs/1-Domain-Discovery-Report.md` | Entidades preliminares y procesos de negocio. |
| 2 | `/docs/2-Product-Owner-Decisions.md` | Idiomas, moneda, branding, moderación, seed. |
| 3 | `/docs/3-MVP-Scope-Definition.md` | Tipos de evento, entidades MVP, alcance. |
| 4 | `/docs/4-Business-Rules-Document.md` | Reglas de integridad físicas (BR-*). |
| 5 | `/docs/5-User-Roles-Permissions-Matrix.md` | Ownership y autorización a nivel modelo. |
| 6 | `/docs/6-Domain-Data-Model.md` | **Fuente principal**: entidades, atributos, enums, constraints, índices sugeridos. |
| 7 | `/docs/7-AI-Features-Specification.md` | Features IA → tipos de `AIRecommendation`. |
| 8 | `/docs/8-Use-Cases-Specification.md` | Operaciones que requieren transacciones. |
| 9 | `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md` | Decisiones físicas vinculantes (rating, validez, timeout, soft delete). |
| 10 | `/docs/8.2-Documentation-Alignment-Review-Before-FRD.md` | Alineación de inconsistencias previas. |
| 11 | `/docs/9-Functional-Requirements-Document.md` | FR-* → endpoints y queries que dirigen índices. |
| 12 | `/docs/10-Non-Functional-Requirements.md` | Performance, seguridad, privacidad, escala MVP. |
| 13 | `/docs/11-Data-Seed-Strategy.md` | `is_seed`, reset surgical, determinismo. |
| 14 | `/docs/12-Architecture-Vision-and-Principles.md` | Principios arquitectónicos. |
| 15 | `/docs/13-System-Architecture-Document.md` | Stack global. |
| 16 | `/docs/14-Backend-Technical-Design.md` | Repositorios, transacciones, casos de uso. |
| 17 | `/docs/15-Frontend-Architecture-Design.md` | Solo verifica que el modelo soporta los flujos UI. |
| 18 | `/docs/16-API-Design-Specification.md` | Endpoints, filtros y paginación → índices. |
| 19 | `/docs/17-AI-Architecture-and-PromptOps-Design.md` | **Fuente principal IA**: `AIRecommendation`, `AIPromptVersion`, PromptOps, fallback, timeout. |

---

## 4. Resumen ejecutivo

EventFlow se materializa físicamente sobre:

- **PostgreSQL 15+** como base de datos primaria, monolito lógico, un solo schema (`public`).
- **Prisma ORM** como herramienta de modelado, migraciones y typesafe access.
- **UUID v4** como tipo de identificador para todas las tablas operativas.
- **Núcleo relacional fuerte** con foreign keys, unique constraints (incluyendo unique parciales para soft delete), check constraints y enums nativos.
- **JSONB** restringido a payloads IA, metadata de admin, payload de notificaciones, brief y desglose de cotización y metadata de adjuntos.
- **Soft delete obligatorio** en `reviews`, `attachments`, `service_categories`, `event_types`, `vendor_profiles` (vía status).
- **Auditoría** centralizada en `admin_actions` (append-only) y trazabilidad cruzada vía `admin_action_id`.
- **Trazabilidad IA completa** con `ai_recommendations` (lifecycle human-in-the-loop) y `ai_prompt_versions` (registro híbrido: catálogo en código + tabla opcional para trazabilidad histórica).
- **Soporte seed determinístico** con `is_seed boolean` en todas las tablas operativas y reset surgical via `DELETE WHERE is_seed = true`.
- **Índices query-driven** derivados directamente de los endpoints listados en `/docs/16-API-Design-Specification.md`, con uso de índices parciales para soft delete y status activo.
- **Sin pagos, contratos, chat real-time, SMS, push, calendarios externos, RSVP**: el esquema físico bloquea la introducción accidental de estas estructuras.

---

## 5. Principios de diseño físico de base de datos

| # | Principio | Implicación física |
|---:|---|---|
| P-01 | Trazabilidad a documentos fuente | Toda tabla, columna, enum o índice rastrea a uno o más documentos del §3. |
| P-02 | PostgreSQL first, Prisma compatible | Se aprovechan tipos nativos (`uuid`, `timestamptz`, `numeric`, `jsonb`, enums) sin perder la capacidad de declararlos en `schema.prisma`. |
| P-03 | Constraints en el motor cuando aportan integridad | Unicidad, check de rango (rating 1–5, profundidad ≤ 2), `valid_until` por defecto, integridad referencial. |
| P-04 | Validaciones complejas en capa de servicio | Reglas dependientes de estado, autorización, ownership, conteo de cuotas (5 active quote requests). El motor refuerza, no sustituye. |
| P-05 | Sin sobreingeniería | Sin triggers, sin stored procedures, sin materialized views, sin particionado, sin extensiones más allá de `pgcrypto` (opcional). |
| P-06 | Trazabilidad IA mandatoria | Toda `ai_recommendation` registra prompt versionado, proveedor, payload de entrada/salida, latencia, fallback, status y correlation_id. |
| P-07 | Soft delete preservando historia | Para `reviews`, `attachments`, `service_categories`, `event_types`, `vendor_profiles` (vía status). |
| P-08 | Seed determinístico | UUIDs deterministas para fixtures críticos; `is_seed` aísla demo de operativos. |
| P-09 | Ownership soportado en el modelo | Cada recurso lleva owner FK y/o asociación que el backend usa para autorización. |
| P-10 | Límites MVP cerrados | Sin tablas de pagos, comisiones, contratos, chat, push, RSVP, KYC, tipos de cambio, embeddings. |
| P-11 | Naming consistente snake_case | Tablas y columnas en `snake_case`, enums PostgreSQL en `snake_case`, modelos Prisma en `PascalCase`. |
| P-12 | Migraciones forward-only | Sin rollback automático en producción; el rollback se aborda mediante migración correctiva. |

---

## 6. Stack de persistencia aprobado

| Componente | Selección | Versión recomendada | Fuente |
|---|---|---|---|
| RDBMS | PostgreSQL | 15+ (preferible 16) | `13-System-Architecture-Document.md` |
| ORM / schema toolkit | Prisma | 5.x LTS | `14-Backend-Technical-Design.md` |
| Lenguaje runtime | Node.js | LTS 20.x | `14-Backend-Technical-Design.md` |
| Tipado | TypeScript | 5.x `strict` | `14-Backend-Technical-Design.md` |
| Cliente DB | `@prisma/client` | Vinculado a Prisma | — |
| Extensiones PostgreSQL | `pgcrypto` (opcional) | Para `gen_random_uuid()` si se delega generación al motor | — |

El backend permanece como un monolito modular (NestJS o Express). El acceso a base de datos siempre pasa por el adaptador Prisma. No existen conexiones directas desde otros componentes.

---

## 7. Convenciones de naming

| Elemento | Convención | Ejemplo |
|---|---|---|
| Tabla | `snake_case`, plural, nombre del agregado | `events`, `vendor_profiles`, `ai_recommendations` |
| Modelo Prisma | `PascalCase`, singular | `Event`, `VendorProfile`, `AIRecommendation` |
| Columna | `snake_case` | `event_date`, `currency_code`, `is_seed` |
| Campo Prisma | `camelCase` mapeado con `@map` | `eventDate @map("event_date")` |
| Enum PostgreSQL | `snake_case`, singular | `event_status`, `quote_status`, `llm_provider` |
| Enum Prisma | `PascalCase` | `EventStatus`, `QuoteStatus`, `LLMProvider` |
| Valores enum | `snake_case` | `confirmed_intent`, `email_simulated`, `quote_request_received` |
| Foreign key | `<entidad>_id` | `event_id`, `vendor_profile_id`, `prompt_version_id` |
| Índice | `idx_<tabla>_<columnas>[_partial]` | `idx_events_owner_id_status`, `idx_quotes_valid_until_active` |
| Unique constraint | `uq_<tabla>_<columnas>` | `uq_users_email_lower`, `uq_reviews_event_vendor` |
| Check constraint | `chk_<tabla>_<descripcion>` | `chk_reviews_rating_range`, `chk_service_categories_depth` |
| FK constraint | `fk_<tabla>_<columna>` | `fk_events_owner_id` |
| Migración Prisma | timestamp + nombre kebab-case | `20260615120000_add_ai_recommendations_validated_payload` |
| Timestamps | `created_at`, `updated_at`, `*_at` | `confirmed_at`, `accepted_at`, `deleted_at` |
| Booleanos | `is_*`, `has_*`, `requires_*`, `auto_*`, `ai_*`, `*_used` | `is_seed`, `ai_generated`, `fallback_used`, `auto_completed` |

---

## 8. Estrategia de IDs, timestamps y auditoría básica

### 8.1 IDs primarios

- **Tipo:** `uuid`, generado a nivel aplicación con `uuid` v4 vía `@paralleldrive/cuid2` o `crypto.randomUUID()`. Alternativa motor: `gen_random_uuid()` con `pgcrypto`.
- **Justificación:** evita acoplamiento entre cliente y secuencia de la base; favorece seed determinístico (asignación explícita) y entornos distribuidos.
- **Excepción:** catálogos enum no llevan PK uuid; van como enum nativo o tabla con PK `code` (string).

### 8.2 Timestamps obligatorios

| Columna | Tipo | Default | Notas |
|---|---|---|---|
| `created_at` | `timestamptz` | `now()` | Toda tabla operativa. |
| `updated_at` | `timestamptz` | `now()` | Toda tabla operativa con mutaciones; Prisma `@updatedAt`. |
| `deleted_at` | `timestamptz` | `null` | Para soft delete con `deleted_at IS NULL` como filtro. |

Todos los timestamps se almacenan en `timestamptz` (UTC). La conversión a zona horaria del usuario ocurre en el frontend o capa de servicio.

### 8.3 Auditoría básica por fila

Tablas con flujo de aprobación o moderación llevan columnas `*_by` y `*_at` específicas: `approved_by`, `approved_at`, `moderated_by`, `moderated_at`, `deleted_by`, `cancelled_by`, `deactivated_by`. Estas referencian `users.id` (admin u owner según el flujo) sin cascada destructiva.

### 8.4 Auditoría administrativa formal

Las acciones administrativas con efecto en el dominio (aprobar vendor, ocultar review, mover categoría, etc.) generan un registro en `admin_actions`. Esto se complementa con la columna `admin_action_id` en `reviews` y `attachments` para trazabilidad cruzada inmediata.

### 8.5 Marca seed

Todas las tablas operativas llevan `is_seed boolean NOT NULL DEFAULT false`. Habilita reset surgical (`DELETE WHERE is_seed = true`) y separación lógica del dataset demo.

---

## 9. Estrategia de tipos PostgreSQL

| Concepto del dominio | Tipo físico | Justificación |
|---|---|---|
| Identificador opaco | `uuid` | Estabilidad cross-environment, seed determinístico, evita filtración de cardinalidad. |
| Texto libre corto (nombre, slug, código) | `text` o `varchar(n)` con CHECK | Prisma usa `String`; sin límite hace `text`; para slugs estables, `varchar(64)` con CHECK. |
| Texto libre largo (bio, descripción, comentario) | `text` | Sin penalización en PostgreSQL. |
| Email | `citext` o `text` con `LOWER(email)` indexado | MVP usa `text` + índice único sobre `LOWER(email)` para case-insensitive. |
| Moneda y montos | `numeric(14, 2)` | Precisión decimal exacta, evita errores binarios; rango suficiente para presupuestos MVP. |
| Conteos / offsets | `integer` | Suficiente; sin BIGINT en MVP. |
| Booleanos | `boolean` | — |
| Fecha (sin hora) | `date` | `event_date`, `due_date`, `valid_until`. |
| Fecha + hora con zona | `timestamptz` | Todos los timestamps de auditoría y de eventos del dominio. |
| Payloads estructurados IA / metadata | `jsonb` | Indexable, comprimido, validado con Zod en aplicación. |
| Conjuntos cerrados de valores | `enum` PostgreSQL nativo | Coherencia con Prisma `enum`. |
| Arrays cortos cerrados (`languages_supported`) | `text[]` con CHECK o enum array | `varchar[]` o `text[]` con validación. Prisma soporta `String[]`. |
| URL | `text` con CHECK opcional (regex) | Sin tipo nativo; validación en aplicación. |
| MIME type | `varchar(127)` | Cumple RFC 6838. |
| IP address | `inet` opcional | Para `admin_actions.ip_address`. |

### 9.1 Reglas duras

- Nunca `money` (deprecado en PostgreSQL). Siempre `numeric`.
- Nunca `timestamp` sin zona. Siempre `timestamptz`.
- Nunca `varchar` sin propósito; preferir `text` salvo necesidad de tope.
- Nunca `serial`/`bigserial` para IDs primarios; siempre `uuid`.
- Nunca `jsonb` como sustituto de columnas filtrables: si se filtra por un atributo, se promueve a columna.

---

## 10. Estrategia Prisma

### 10.1 Estructura de archivos

```
prisma/
  schema.prisma            # Schema único MVP
  migrations/              # Historial Prisma migrate
    20260601000000_init/
  seed.ts                  # Script de seed (ver §27)
```

### 10.2 Modelo de mapeo

| Concepto | Prisma | PostgreSQL |
|---|---|---|
| Tabla → modelo | `@@map("events")` | tabla `events` |
| Columna → campo | `@map("event_date")` | columna `event_date` |
| UUID | `String @id @default(uuid())` | `uuid` |
| `numeric(14,2)` | `Decimal @db.Decimal(14, 2)` | `numeric(14, 2)` |
| `timestamptz` | `DateTime @db.Timestamptz(6)` | `timestamptz` |
| `jsonb` | `Json @db.JsonB` | `jsonb` |
| Enum | `enum LLMProvider { openai mock anthropic }` | `CREATE TYPE llm_provider AS ENUM (...)` |
| Texto libre | `String @db.Text` | `text` |
| Array | `String[]` | `text[]` |
| Soft delete | `deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)` | `deleted_at timestamptz NULL` |
| Updated at | `updatedAt DateTime @updatedAt @db.Timestamptz(6)` | trigger lógico Prisma |

### 10.3 Índices y constraints

- `@@index([ownerId, status])` para índices compuestos comunes.
- `@@unique([eventId, vendorProfileId])` para unique fuerte.
- Unique parciales (por estado o soft delete) **no expresables nativamente en Prisma**: se declaran como `migration.sql` complementario (raw SQL) tras la migración Prisma. Ver §28.
- Check constraints (rating 1–5, depth ≤ 2, montos ≥ 0): se declaran como **raw SQL migration** anexada a la migración Prisma correspondiente. Ver §24.

### 10.4 Relaciones

- Todas las FK son explícitas con `@relation`.
- `onDelete: Restrict` por defecto. Sólo se usa `Cascade` cuando la relación es de composición pura (e.g. `Budget` → `BudgetItem`).
- No se aplican `SET NULL` agresivos: la nulificación se gestiona en capa de servicio para preservar auditoría.

### 10.5 Excepciones a Prisma puro

| Necesidad | Estrategia |
|---|---|
| Unique parciales | Raw SQL migration. |
| Check constraints | Raw SQL migration. |
| Índices funcionales (`LOWER(email)`) | Raw SQL migration. |
| Índices GIN sobre `jsonb` (opcional) | Raw SQL migration. |
| Renombrado seguro de enums | Migración Prisma + raw SQL para `ALTER TYPE ... ADD VALUE`. |

---

## 11. Mapeo entidad lógica → tabla física

| Entidad lógica (DDM) | Tabla física | Modelo Prisma | Scope | Notas |
|---|---|---|---|---|
| User | `users` | `User` | MVP | Multi-rol mediante enum. |
| Role | (enum) `user_role` | `enum UserRole` | MVP | Sin tabla. |
| Event | `events` | `Event` | MVP | — |
| EventType | `event_types` | `EventType` | MVP | Tabla catálogo con `code` PK derivable de enum. |
| EventTask | `event_tasks` | `EventTask` | MVP | — |
| Budget | `budgets` | `Budget` | MVP | 1:1 con `Event`. |
| BudgetItem | `budget_items` | `BudgetItem` | MVP | — |
| VendorProfile | `vendor_profiles` | `VendorProfile` | MVP | — |
| VendorService | `vendor_services` | `VendorService` | MVP | — |
| ServiceCategory | `service_categories` | `ServiceCategory` | MVP | Jerarquía ≤ 2 niveles. |
| Location | `locations` | `Location` | MVP | Catálogo curado. |
| QuoteRequest | `quote_requests` | `QuoteRequest` | MVP | — |
| Quote | `quotes` | `Quote` | MVP | — |
| BookingIntent | `booking_intents` | `BookingIntent` | MVP | — |
| Review | `reviews` | `Review` | MVP | Soft delete obligatorio. |
| Notification | `notifications` | `Notification` | MVP | — |
| AIRecommendation | `ai_recommendations` | `AIRecommendation` | MVP | — |
| AIPromptVersion | `ai_prompt_versions` | `AIPromptVersion` | MVP (híbrido recomendado) | Registro híbrido (código + tabla). |
| Attachment | `attachments` | `Attachment` | MVP | Polimórfico (owner_type + owner_id). |
| AdminAction | `admin_actions` | `AdminAction` | MVP | Append-only. |
| Currency | (enum) `currency_code` | `enum CurrencyCode` | MVP | Sin tabla. |
| Language | (enum) `language_code` | `enum LanguageCode` | MVP | Sin tabla. |

> **Decisión:** `Currency` y `Language` se modelan como enums (`MVP catálogo`) según `/docs/6-Domain-Data-Model.md §12`. `Location` sí se modela como tabla porque tiene atributos no constantes y crece con la expansión de mercados.

---

## 12. Catálogo físico de tablas MVP

Para cada tabla, este catálogo incluye: propósito, fuente, owner funcional, columnas principales, PK, FK, constraints clave, índices, soft delete, estrategia seed y notas. Las definiciones detalladas por entidad están en §13 a §21.

| # | Tabla | Owner | PK | Soft delete | Seed | Append-only |
|---:|---|---|---|---|---|---|
| 1 | `users` | Shared (System + Self) | `id uuid` | No (status) | Sí | No |
| 2 | `events` | Organizer | `id uuid` | No (status) | Sí | No |
| 3 | `event_types` | Admin | `code` | Sí (`is_active`) | Sí | No |
| 4 | `event_tasks` | Organizer | `id uuid` | No | Sí | No |
| 5 | `budgets` | Organizer | `id uuid` | No | Sí | No |
| 6 | `budget_items` | Organizer | `id uuid` | No | Sí | No |
| 7 | `vendor_profiles` | Vendor + Admin | `id uuid` | Sí (status) | Sí | No |
| 8 | `vendor_services` | Vendor | `id uuid` | Sí (`is_active`) | Sí | No |
| 9 | `service_categories` | Admin | `id uuid` | Sí (`is_active`) | Sí | No |
| 10 | `locations` | Admin | `id uuid` | Sí (`is_active`) | Sí | No |
| 11 | `quote_requests` | Organizer | `id uuid` | No (status) | Sí | No |
| 12 | `quotes` | Vendor | `id uuid` | No (status) | Sí | No |
| 13 | `booking_intents` | Organizer + Vendor | `id uuid` | No (status) | Sí | No |
| 14 | `reviews` | Organizer + Admin | `id uuid` | Sí (status) | Sí | No |
| 15 | `notifications` | System | `id uuid` | No (status) | Sí | No |
| 16 | `attachments` | Owner del padre | `id uuid` | Sí (status) | Sí | No |
| 17 | `admin_actions` | System | `id uuid` | No | Sí | Sí (append-only) |
| 18 | `ai_recommendations` | User + Admin | `id uuid` | No (status) | Sí | No |
| 19 | `ai_prompt_versions` | System | `id uuid` | No (status) | Sí | Sí (no edita versión publicada) |

---

## 13. Diseño físico de `users`

### 13.1 Propósito

Persistir la identidad de usuarios (organizer, vendor, admin) con el hash de contraseña, idioma preferido y rol activo único.

### 13.2 Columnas

| Columna | Tipo | NN | Default | Notas |
|---|---|---|---|---|
| `id` | `uuid` | Sí | app-gen | PK. |
| `email` | `text` | Sí | — | Único case-insensitive (índice funcional sobre `LOWER(email)`). |
| `password_hash` | `text` | Sí | — | bcrypt/argon2; nunca expuesto. |
| `name` | `text` | Sí | — | — |
| `phone` | `text` | No | — | Opcional. |
| `role` | `user_role` | Sí | — | Enum (`organizer`, `vendor`, `admin`). |
| `preferred_language` | `language_code` | Sí | `'es-LATAM'` | BR-USER-006. |
| `status` | `user_status` | Sí | `'active'` | (`active`, `suspended`). |
| `is_seed` | `boolean` | Sí | `false` | — |
| `created_at` | `timestamptz` | Sí | `now()` | — |
| `updated_at` | `timestamptz` | Sí | `now()` | — |

### 13.3 Constraints

- PK: `users_pkey (id)`.
- Único funcional: `uq_users_email_lower ON (LOWER(email))`.
- CHECK: `chk_users_email_not_empty (email <> '')`.
- CHECK: `chk_users_password_hash_not_empty (password_hash <> '')`.

### 13.4 Índices

| Índice | Columnas | Tipo | Justificación |
|---|---|---|---|
| `uq_users_email_lower` | `LOWER(email)` | unique | Login y unicidad case-insensitive. |
| `idx_users_role_status` | `(role, status)` | btree | Admin filtra por rol y estado. |
| `idx_users_is_seed` | `(is_seed) WHERE is_seed = true` | btree parcial | Reset seed. |

### 13.5 Soft delete

`users` no usa soft delete; el estado de suspensión vive en `status` y la eliminación efectiva es admin-only y manual.

### 13.6 Seed y notas

- Seed admin con UUID determinístico.
- Emails seed convencionalmente con dominio `@eventflow.demo`.
- Captcha/anti-bot (C-059) se valida en middleware; **no se persisten secretos captcha en la base** (BR-AUTH-011, NFR-SEC).

---

## 14. Diseño físico de eventos y planificación

### 14.1 `events`

| Columna | Tipo | NN | Default | Notas |
|---|---|---|---|---|
| `id` | `uuid` | Sí | app-gen | PK. |
| `owner_id` | `uuid` | Sí | — | FK → `users.id`. |
| `event_type_code` | `event_type_code` | Sí | — | Enum (catálogo cerrado). |
| `name` | `text` | No | — | — |
| `event_date` | `date` | Sí | — | BR-EVENT-003. |
| `guests_count` | `integer` | Sí | — | CHECK `>= 1`. |
| `location_id` | `uuid` | Sí | — | FK → `locations.id`. |
| `estimated_budget` | `numeric(14, 2)` | Sí | — | CHECK `>= 0`. |
| `currency_code` | `currency_code` | Sí | — | **Inmutable post-creación (C-008)**. |
| `language_code` | `language_code` | Sí | — | — |
| `status` | `event_status` | Sí | `'draft'` | — |
| `completed_at` | `timestamptz` | No | — | BR-EVENT-013. |
| `auto_completed` | `boolean` | Sí | `false` | — |
| `notes` | `text` | No | — | — |
| `is_seed` | `boolean` | Sí | `false` | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | `now()` | — |

**Constraints:**
- FK `fk_events_owner_id (owner_id)` con `ON DELETE RESTRICT`.
- FK `fk_events_location_id (location_id)` con `ON DELETE RESTRICT`.
- CHECK `chk_events_guests_count_positive (guests_count >= 1)`.
- CHECK `chk_events_estimated_budget_nonneg (estimated_budget >= 0)`.
- Inmutabilidad de `currency_code`: **aplicada en service layer** (capa Prisma rechaza el campo en `PATCH`); opcional refuerzo motor con trigger se considera y se **descarta para MVP** (overengineering).

**Índices:**

| Índice | Columnas | Tipo | Justificación |
|---|---|---|---|
| `idx_events_owner_id` | `(owner_id)` | btree | Mis eventos. |
| `idx_events_owner_status_date` | `(owner_id, status, event_date)` | btree | Listado con filtros. |
| `idx_events_status_event_date_active` | `(status, event_date) WHERE status IN ('active','draft')` | parcial | Listados activos. |
| `idx_events_auto_complete_candidates` | `(event_date) WHERE status = 'active'` | parcial | Job de cierre automático (BR-EVENT-013). |
| `idx_events_is_seed` | `(is_seed) WHERE is_seed = true` | parcial | Reset seed. |

### 14.2 `event_types`

Tabla catálogo curada por admin con `code` PK derivado del enum `event_type_code`.

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `code` | `event_type_code` | Sí | PK. |
| `display_name` | `jsonb` | Sí | i18n por idioma. |
| `description` | `jsonb` | No | i18n. |
| `default_template_ref` | `text` | No | Referencia a plantilla en código/seed. |
| `sort_order` | `integer` | No | — |
| `is_active` | `boolean` | Sí | Soft delete. |
| `deactivated_at` | `timestamptz` | No | — |
| `deactivated_by` | `uuid` | No | FK → `users.id`. |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Constraint clave:** **Sin hard delete si hay eventos asociados** (C-026c). El servicio admin valida `SELECT COUNT(*) FROM events WHERE event_type_code = $1` antes de aceptar un DELETE; en caso contrario solo `is_active = false`.

### 14.3 `event_tasks`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `event_id` | `uuid` | Sí | FK → `events.id` ON DELETE CASCADE (composición). |
| `title` | `text` | Sí | — |
| `description` | `text` | No | — |
| `due_date` | `date` | No | — |
| `relative_offset_days` | `integer` | No | — |
| `status` | `task_status` | Sí | Default `'pending'`. |
| `ai_generated` | `boolean` | Sí | Default `false`. |
| `ai_recommendation_id` | `uuid` | No | FK → `ai_recommendations.id` ON DELETE SET NULL. |
| `category_hint` | `text` | No | — |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Índices:**
- `idx_event_tasks_event_id` `(event_id)`.
- `idx_event_tasks_event_id_status` `(event_id, status)`.
- `idx_event_tasks_due_date_pending` `(due_date) WHERE status = 'pending'` (reminders).

### 14.4 `budgets`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `event_id` | `uuid` | Sí | **UNIQUE** (1:1) FK → `events.id` ON DELETE CASCADE. |
| `total_planned` | `numeric(14, 2)` | Sí | Default `0`. |
| `total_committed` | `numeric(14, 2)` | Sí | Default `0`. |
| `currency_code` | `currency_code` | Sí | = `events.currency_code`. |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Constraints:**
- `uq_budgets_event_id (event_id)`.
- CHECK `chk_budgets_totals_nonneg (total_planned >= 0 AND total_committed >= 0)`.

### 14.5 `budget_items`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `budget_id` | `uuid` | Sí | FK → `budgets.id` ON DELETE CASCADE. |
| `service_category_id` | `uuid` | Sí | FK → `service_categories.id` ON DELETE RESTRICT. |
| `label` | `text` | No | — |
| `planned` | `numeric(14, 2)` | Sí | CHECK `>= 0`. |
| `committed` | `numeric(14, 2)` | Sí | CHECK `>= 0`. |
| `paid` | `numeric(14, 2)` | No | CHECK `>= 0`. |
| `ai_generated` | `boolean` | Sí | Default `false`. |
| `ai_recommendation_id` | `uuid` | No | FK → `ai_recommendations.id` ON DELETE SET NULL. |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Índices:** `idx_budget_items_budget_id (budget_id)`, `idx_budget_items_service_category (service_category_id)`.

---

## 15. Diseño físico de proveedores y catálogo

### 15.1 `vendor_profiles`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `user_id` | `uuid` | Sí | UNIQUE; FK → `users.id` ON DELETE RESTRICT. |
| `business_name` | `text` | Sí | — |
| `bio` | `text` | Sí | — |
| `location_id` | `uuid` | Sí | FK → `locations.id`. |
| `languages_supported` | `language_code[]` | Sí | Array; CHECK no vacío. |
| `status` | `vendor_status` | Sí | Default `'pending'`. |
| `subscription_status` | `subscription_status` | No | Default `'inactive'`. |
| `availability_summary` | `text` | No | — |
| `rating_avg` | `numeric(3, 2)` | No | Desnormalizado. |
| `reviews_count` | `integer` | No | Default `0`. |
| `ai_generated_bio` | `boolean` | Sí | Default `false`. |
| `approved_by` | `uuid` | No | FK → `users.id`. |
| `approved_at` | `timestamptz` | No | — |
| `category_change_count` | `integer` | Sí | Default `0`; CHECK `<= 5`. |
| `last_category_change_at` | `timestamptz` | No | — |
| `requires_admin_review` | `boolean` | Sí | Default `false`. |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Índices:**

| Índice | Columnas | Tipo | Justificación |
|---|---|---|---|
| `uq_vendor_profiles_user_id` | `(user_id)` | unique | 1:1 con `users`. |
| `idx_vendor_profiles_status` | `(status)` | btree | Cola de aprobación admin. |
| `idx_vendor_profiles_status_location` | `(status, location_id) WHERE status = 'approved'` | parcial | Directorio público. |
| `idx_vendor_profiles_business_name_trgm` | `(business_name) WHERE status='approved'` | gin/trigram opcional | Búsqueda directorio (opcional MVP). |

**Constraints:** `chk_vendor_profiles_category_change_max (category_change_count <= 5)`.

### 15.2 `vendor_services`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `vendor_profile_id` | `uuid` | Sí | FK → `vendor_profiles.id` ON DELETE CASCADE. |
| `service_category_id` | `uuid` | Sí | FK → `service_categories.id` ON DELETE RESTRICT. |
| `package_name` | `text` | Sí | — |
| `description` | `text` | Sí | — |
| `base_price` | `numeric(14, 2)` | Sí | CHECK `>= 0`. |
| `currency_code` | `currency_code` | Sí | — |
| `ai_generated_description` | `boolean` | Sí | Default `false`. |
| `is_active` | `boolean` | Sí | Default `true`. |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Índices:** `idx_vendor_services_vendor_profile_id`, `idx_vendor_services_service_category_id`, `idx_vendor_services_active (vendor_profile_id) WHERE is_active = true`.

### 15.3 `service_categories`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `code` | `varchar(64)` | Sí | UNIQUE; slug. |
| `display_name` | `jsonb` | Sí | i18n. |
| `description` | `text` | No | — |
| `parent_id` | `uuid` | No | FK self → `service_categories.id`. |
| `depth_level` | `integer` | Sí | CHECK `BETWEEN 1 AND 2` (C-026b). |
| `is_active` | `boolean` | Sí | Soft delete. |
| `sort_order` | `integer` | No | — |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Constraint adicional:** `chk_service_categories_depth_two_levels` — el servicio valida que `parent.parent_id IS NULL` cuando se asigna `parent_id`. Equivalente en motor mediante check con subquery se descarta (overengineering); se delega a aplicación + check `depth_level <= 2`.

**Índices:** `uq_service_categories_code`, `idx_service_categories_parent_id`, `idx_service_categories_active (is_active) WHERE is_active = true`.

### 15.4 Adjuntos de portafolio

Se modelan vía la tabla `attachments` polimórfica con `owner_type = 'vendor_work'` (ver §19). Esto soporta agrupación por trabajo/evento mostrado y el límite de 10 imágenes por trabajo (BR-VENDOR-005).

---

## 16. Diseño físico del flujo de cotización

### 16.1 `quote_requests`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `event_id` | `uuid` | Sí | FK → `events.id` ON DELETE RESTRICT. |
| `vendor_profile_id` | `uuid` | Sí | FK → `vendor_profiles.id`. |
| `service_category_id` | `uuid` | Sí | FK → `service_categories.id`. |
| `brief` | `jsonb` | Sí | Brief estructurado. |
| `language_code` | `language_code` | Sí | — |
| `status` | `quote_request_status` | Sí | Default `'sent'`. |
| `viewed_at` | `timestamptz` | No | — |
| `ai_generated_brief` | `boolean` | Sí | Default `false`. |
| `ai_recommendation_id` | `uuid` | No | FK → `ai_recommendations.id` ON DELETE SET NULL. |
| `cancelled_reason` | `text` | No | — |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Unique parciales:**

```sql
CREATE UNIQUE INDEX uq_quote_requests_event_vendor_active
  ON quote_requests (event_id, vendor_profile_id)
  WHERE status IN ('sent','viewed','responded');
```

**Constraint contado (5 activos por categoría — C-027b):** Validación atómica en `CreateQuoteRequestUseCase` (`prisma.$transaction`) con recount + insert. No se modela como check porque PostgreSQL no expresa de forma trivial conteos cross-row. Aceptado en `/docs/14-Backend-Technical-Design.md`.

**Índices:**

| Índice | Columnas | Tipo | Justificación |
|---|---|---|---|
| `idx_quote_requests_vendor_status` | `(vendor_profile_id, status)` | btree | Bandeja del proveedor. |
| `idx_quote_requests_event_status` | `(event_id, status)` | btree | Comparador del organizador. |
| `idx_quote_requests_event_category_active` | `(event_id, service_category_id) WHERE status IN ('sent','viewed','responded')` | parcial | Conteo 5 activos. |

### 16.2 `quotes`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `quote_request_id` | `uuid` | Sí | FK → `quote_requests.id` ON DELETE RESTRICT. |
| `vendor_profile_id` | `uuid` | Sí | FK → `vendor_profiles.id`. |
| `total_price` | `numeric(14, 2)` | Sí | CHECK `>= 0`. |
| `currency_code` | `currency_code` | Sí | = `events.currency_code`. |
| `breakdown` | `jsonb` | Sí | Desglose simple. |
| `conditions` | `text` | No | — |
| `valid_until` | `date` | Sí | Default = `(created_at::date + INTERVAL '15 days')` (C-031). |
| `status` | `quote_status` | Sí | Default `'draft'`. |
| `is_preferred` | `boolean` | Sí | Default `false`. |
| `accepted_at` | `timestamptz` | No | — |
| `rejected_at` | `timestamptz` | No | — |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Unique parcial:**

```sql
CREATE UNIQUE INDEX uq_quotes_request_active
  ON quotes (quote_request_id)
  WHERE status NOT IN ('expired','rejected');
```

**Default de `valid_until`:** Se aplica en service layer en el momento de `sent` (no en `draft`); refuerzo opcional con `DEFAULT (CURRENT_DATE + INTERVAL '15 days')`.

**Índices:** `idx_quotes_quote_request_id`, `idx_quotes_status`, `idx_quotes_valid_until_active (valid_until) WHERE status = 'sent'` (job de expiración).

### 16.3 `booking_intents`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `quote_id` | `uuid` | Sí | FK → `quotes.id`. |
| `event_id` | `uuid` | Sí | FK → `events.id`. |
| `vendor_profile_id` | `uuid` | Sí | FK → `vendor_profiles.id`. |
| `service_category_id` | `uuid` | Sí | FK → `service_categories.id`. |
| `status` | `booking_intent_status` | Sí | Default `'pending'`. |
| `confirmed_at` | `timestamptz` | No | — |
| `cancelled_at` | `timestamptz` | No | — |
| `cancelled_by` | `booking_cancelled_by` | No | (`organizer`, `vendor`, `system`). |
| `cancellation_reason` | `text` | No | — |
| `is_simulated` | `boolean` | Sí | Default `true`; CHECK `= true` (MVP). |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Unique parcial (C-037):**

```sql
CREATE UNIQUE INDEX uq_booking_intents_event_category_confirmed
  ON booking_intents (event_id, service_category_id)
  WHERE status = 'confirmed_intent';
```

**Índices:** `idx_booking_intents_event_id`, `idx_booking_intents_vendor_profile_id`.

---

## 17. Diseño físico de reseñas y moderación

### 17.1 `reviews`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `event_id` | `uuid` | Sí | FK → `events.id`. |
| `vendor_profile_id` | `uuid` | Sí | FK → `vendor_profiles.id`. |
| `author_id` | `uuid` | Sí | FK → `users.id`. |
| `booking_intent_id` | `uuid` | Sí | FK → `booking_intents.id`. |
| `rating` | `integer` | Sí | CHECK `BETWEEN 1 AND 5` (C-041). |
| `comment` | `text` | Sí | — |
| `status` | `review_status` | Sí | Default `'published'`; soft delete obligatorio (C-043). |
| `moderated_by` | `uuid` | No | FK → `users.id` (admin). |
| `moderated_at` | `timestamptz` | No | — |
| `moderation_reason` | `text` | No | Obligatorio cuando `status IN ('hidden','removed')`. |
| `admin_action_id` | `uuid` | No | FK → `admin_actions.id`. |
| `is_seed` | `boolean` | Sí | — |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Constraints:**
- `uq_reviews_event_vendor (event_id, vendor_profile_id)` (C-040).
- `chk_reviews_rating_range (rating BETWEEN 1 AND 5)`.
- CHECK lógico (service-level): si `status IN ('hidden','removed')` ⇒ `moderation_reason IS NOT NULL AND admin_action_id IS NOT NULL`.

**Soft delete:** No se elimina físicamente; transiciones `published → hidden → removed` preservan la fila para auditoría.

**Índices:**
- `idx_reviews_vendor_status_rating (vendor_profile_id, status, rating)`.
- `idx_reviews_vendor_status_published (vendor_profile_id) WHERE status='published'` (directorio).
- `idx_reviews_author_id (author_id)`.

---

## 18. Diseño físico de notificaciones

### 18.1 `notifications`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `user_id` | `uuid` | Sí | FK → `users.id`. |
| `type` | `notification_type` | Sí | — |
| `payload` | `jsonb` | Sí | Datos contextuales. |
| `channel` | `notification_channel` | Sí | (`in_app`, `email_simulated`). |
| `language_code` | `language_code` | Sí | — |
| `status` | `notification_status` | Sí | Default `'unread'`. |
| `read_at` | `timestamptz` | No | — |
| `sent_at` | `timestamptz` | Sí | Default `now()`. |
| `is_seed` | `boolean` | Sí | — |
| `created_at` | `timestamptz` | Sí | — |

**Índices:**
- `idx_notifications_user_status_sent (user_id, status, sent_at DESC)`.
- `idx_notifications_user_unread (user_id) WHERE status = 'unread'` (badge UI).

**Email simulado:** Se persiste el registro `notification` con `channel='email_simulated'` y se loguea estructuradamente en aplicación. **No se modela una tabla `notification_delivery_log` en MVP**: la trazabilidad mínima vive en `notifications` y en logs estructurados.

---

## 19. Diseño físico de attachments

### 19.1 `attachments`

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `owner_type` | `attachment_owner_type` | Sí | (`vendor_profile`, `vendor_work`, `quote_request`). |
| `owner_id` | `uuid` | Sí | ID del recurso padre (sin FK formal, validado en service). |
| `work_label` | `text` | No | Sólo para `owner_type='vendor_work'`. |
| `url` | `text` | Sí | URL pública o firmada. |
| `mime_type` | `varchar(127)` | Sí | — |
| `size_bytes` | `integer` | No | CHECK `>= 0`. |
| `label` | `text` | No | — |
| `sort_order` | `integer` | No | — |
| `uploaded_by` | `uuid` | Sí | FK → `users.id`. |
| `status` | `attachment_status` | Sí | Default `'active'`. |
| `deleted_at` | `timestamptz` | No | — |
| `deleted_by` | `uuid` | No | FK → `users.id`. |
| `deletion_reason` | `text` | No | — |
| `is_seed` | `boolean` | Sí | — |
| `created_at` | `timestamptz` | Sí | — |

**Ownership polimórfico:** validado en service layer (no se modela FK polimórfica nativa). El servicio garantiza que `(owner_type, owner_id)` apunta a una entidad existente y que el `uploaded_by` tiene permiso sobre el padre.

**Límite 10 imágenes por trabajo (BR-VENDOR-005):** Aplicado en service via:
```sql
SELECT COUNT(*) FROM attachments
 WHERE owner_type='vendor_work' AND owner_id=$1 AND work_label=$2 AND status='active';
```

**Soft delete obligatorio (C-060):** `status='deleted'`, `deleted_at`, `deleted_by`. La eliminación física del archivo en storage es responsabilidad de un proceso de mantenimiento externo, no del schema.

**Índices:**
- `idx_attachments_owner (owner_type, owner_id, status)`.
- `idx_attachments_vendor_work (owner_id, work_label) WHERE owner_type='vendor_work' AND status='active'` (límite 10).
- `idx_attachments_uploaded_by (uploaded_by)`.

**Sin documentos sensibles:** El MVP no almacena cédulas, comprobantes legales, contratos o medios de pago (BR-OOS-001/010, BR-PRIVACY-006).

---

## 20. Diseño físico de auditoría administrativa

### 20.1 `admin_actions`

Tabla **append-only**: no `UPDATE`, no `DELETE` en operación normal.

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `admin_id` | `uuid` | Sí | FK → `users.id` con `role='admin'`. |
| `action` | `admin_action_type` | Sí | Enum cerrado (ver §23). |
| `target_type` | `text` | Sí | Entidad afectada. |
| `target_id` | `uuid` | No | — |
| `reason` | `text` | No | — |
| `metadata` | `jsonb` | No | Contexto (snapshot, valores previos/nuevos). |
| `ip_address` | `inet` | No | Opcional. |
| `is_seed` | `boolean` | Sí | — |
| `created_at` | `timestamptz` | Sí | Default `now()`. |

**Constraints:**
- Sin `updated_at`: la tabla no se actualiza.
- A nivel motor se podría usar `REVOKE UPDATE, DELETE` sobre el rol de aplicación; **opcional MVP**.

**Índices:**
- `idx_admin_actions_admin_created (admin_id, created_at DESC)`.
- `idx_admin_actions_target (target_type, target_id)`.
- `idx_admin_actions_action_created (action, created_at DESC)`.

**Trazabilidad cruzada:** `reviews.admin_action_id` y `attachments` referencian la acción mediante `admin_action_id` (cuando aplica).

---

## 21. Diseño físico de IA y PromptOps

Esta sección es **mandatoria** y se alinea con `/docs/17-AI-Architecture-and-PromptOps-Design.md` y `/docs/6-Domain-Data-Model.md §11 (AIRecommendation)`.

### 21.1 `ai_recommendations`

Almacena cada salida IA con trazabilidad completa: prompt versionado, proveedor, payload de entrada/salida, validación humana, fallback y latencia.

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `type` | `ai_recommendation_type` | Sí | (`event_plan`, `checklist`, `budget_suggestion`, `vendor_categories`, `quote_brief`, `quote_comparison`, `vendor_bio`, `task_prioritization`). |
| `status` | `ai_recommendation_status` | Sí | (`pending`, `accepted`, `rejected`, `discarded`, `failed`, `expired`). |
| `requested_by_user_id` | `uuid` | Sí | FK → `users.id`. |
| `event_id` | `uuid` | No | FK → `events.id`. |
| `vendor_profile_id` | `uuid` | No | FK → `vendor_profiles.id`. |
| `quote_request_id` | `uuid` | No | FK → `quote_requests.id`. |
| `quote_id` | `uuid` | No | FK → `quotes.id`. |
| `llm_provider` | `llm_provider` | Sí | (`openai`, `mock`, `anthropic`). |
| `model` | `text` | No | E.g. `gpt-4o-mini`. |
| `prompt_version_id` | `uuid` | Sí | FK → `ai_prompt_versions.id` (registro híbrido). |
| `language_code` | `language_code` | Sí | — |
| `input_payload` | `jsonb` | Sí | Entrada sanitizada. |
| `output_payload` | `jsonb` | Sí | Salida cruda validada por Zod. |
| `validated_output_payload` | `jsonb` | No | Sólo si el usuario editó antes de aceptar. |
| `accepted` | `boolean` | Sí | Default `false`; derivado de `status='accepted'`. |
| `edited` | `boolean` | Sí | Default `false`. |
| `fallback_used` | `boolean` | Sí | Default `false`. |
| `fallback_reason` | `text` | No | Si aplica. |
| `timeout_ms` | `integer` | Sí | Default `60000` (C-058). |
| `latency_ms` | `integer` | No | — |
| `token_count` | `integer` | No | — |
| `schema_valid` | `boolean` | No | Validación contra Zod del output. |
| `retry_count` | `integer` | Sí | Default `0`. |
| `error_code` | `text` | No | (`AI_INVALID_OUTPUT_SCHEMA`, `AI_PROVIDER_TIMEOUT`, `AI_FALLBACK_USED`, etc.). |
| `error_message` | `text` | No | — |
| `correlation_id` | `text` | Sí | `X-Correlation-Id` request. |
| `accepted_at` | `timestamptz` | No | — |
| `rejected_at` | `timestamptz` | No | — |
| `discarded_at` | `timestamptz` | No | — |
| `expires_at` | `timestamptz` | No | Opcional: cleanup de `pending` antiguos. |
| `is_seed` | `boolean` | Sí | Default `false`. |
| `created_at` / `updated_at` | `timestamptz` | Sí | — |

**Constraints:**
- FK `prompt_version_id` con `ON DELETE RESTRICT` para preservar trazabilidad.
- CHECK `chk_ai_recommendations_timeout_positive (timeout_ms > 0)`.
- CHECK `chk_ai_recommendations_retry_max (retry_count BETWEEN 0 AND 1)` (MVP: max 1 reintento, §17 doc 17).
- CHECK lógico (service-level): cuando `status='accepted'` ⇒ `accepted_at IS NOT NULL`.

**Índices:**

| Índice | Columnas | Justificación |
|---|---|---|
| `idx_ai_rec_user_created` | `(requested_by_user_id, created_at DESC)` | Historial del usuario. |
| `idx_ai_rec_event_type_created` | `(event_id, type, created_at DESC)` | Sugerencias por evento y feature. |
| `idx_ai_rec_status_created` | `(status, created_at DESC)` | Auditoría admin / cleanup. |
| `idx_ai_rec_provider_created` | `(llm_provider, created_at DESC)` | Métricas por proveedor. |
| `idx_ai_rec_correlation_id` | `(correlation_id)` | Cruce con logs. |
| `idx_ai_rec_prompt_version` | `(prompt_version_id)` | Auditoría PromptOps. |
| `idx_ai_rec_pending_expires` | `(expires_at) WHERE status = 'pending'` | Job de expiración. |

### 21.2 `ai_prompt_versions`

**Decisión: enfoque híbrido**.

- El **catálogo canónico** vive como archivos versionados en código (`infrastructure/llm/prompts/v1/...`) según `/docs/17-AI-Architecture-and-PromptOps-Design.md §10/§11`.
- La **tabla `ai_prompt_versions`** persiste el registro de cada versión publicada para permitir consulta desde la base, auditoría histórica desde el panel admin y trazabilidad referencial de `ai_recommendations.prompt_version_id` como FK fuerte.

**Por qué híbrido:**
- Trazabilidad fuerte: `ai_recommendations.prompt_version_id` es FK no nullable; el motor garantiza integridad.
- Reproducibilidad: el cuerpo del prompt vive en Git; el hash en la tabla detecta drift.
- No es enterprise prompt management: no se editan prompts en runtime ni se hace A/B testing dinámico.

| Columna | Tipo | NN | Notas |
|---|---|---|---|
| `id` | `uuid` | Sí | PK. |
| `prompt_id` | `varchar(64)` | Sí | E.g. `PROMPT-CHECKLIST`. |
| `version` | `varchar(16)` | Sí | E.g. `V1` o semver. |
| `feature_type` | `ai_recommendation_type` | Sí | — |
| `status` | `prompt_version_status` | Sí | (`draft`, `reviewed`, `approved`, `active`, `deprecated`, `archived`). |
| `supported_languages` | `language_code[]` | Sí | — |
| `input_schema_version` | `text` | No | Ref. al schema Zod del input. |
| `output_schema_version` | `text` | No | Ref. al schema Zod del output. |
| `template_hash` | `varchar(64)` | Sí | SHA-256 del template; detecta drift. |
| `template_ref` | `text` | No | Path en el repositorio. |
| `change_reason` | `text` | No | Changelog. |
| `created_by` | `text` | No | Autor (no FK; valor libre p. ej. usuario Git). |
| `approved_by` | `uuid` | No | FK → `users.id` (admin). |
| `created_at` | `timestamptz` | Sí | — |
| `approved_at` | `timestamptz` | No | — |
| `deprecated_at` | `timestamptz` | No | — |
| `is_seed` | `boolean` | Sí | — |

**Constraints:**
- `uq_prompt_versions_prompt_version (prompt_id, version)`.
- Unique parcial: una sola versión `status='active'` por `prompt_id`:
  ```sql
  CREATE UNIQUE INDEX uq_prompt_versions_active
    ON ai_prompt_versions (prompt_id)
    WHERE status = 'active';
  ```

**Índices:** `idx_prompt_versions_feature_status (feature_type, status)`.

### 21.3 Persistencia human-in-the-loop

La regla **"las salidas IA son sugerencias hasta que el usuario las acepta explícitamente"** se materializa de la siguiente forma:

| Sugerencia IA (lifecycle) | Tabla destino al aceptar | Vinculación |
|---|---|---|
| `checklist` (AI-002) | `event_tasks` (filas `ai_generated=true`, `ai_recommendation_id` set) | Transacción única: `ai_recommendations.status='accepted'` + INSERT `event_tasks`. |
| `budget_suggestion` (AI-003) | `budget_items` (filas `ai_generated=true`, `ai_recommendation_id` set) | Transacción única. |
| `quote_brief` (AI-005) | `quote_requests.brief` JSONB + `ai_generated_brief=true` + `ai_recommendation_id` | Transacción única. |
| `vendor_bio` (AI-007) | `vendor_profiles.bio` (+ `ai_generated_bio=true`) y/o `vendor_services.description` | Transacción única. |
| `vendor_categories` (AI-004) | No materializa entidad; permanece como `ai_recommendation`. | — |
| `quote_comparison` (AI-006) | No materializa entidad; permanece como `ai_recommendation`. | — |
| `event_plan` (AI-001) | No materializa entidad; alimenta AI-002 y AI-003. | — |
| `task_prioritization` (AI-008) | No materializa entidad; flag opcional. | — |

### 21.4 Fallback, timeout y latencia

| Escenario | `fallback_used` | `llm_provider` | `status` | `error_code` |
|---|---|---|---|---|
| OpenAI éxito | `false` | `openai` | `pending` | `null` |
| OpenAI timeout, sin fallback | `false` | `openai` | `failed` | `AI_PROVIDER_TIMEOUT` |
| OpenAI timeout, con fallback | `true` | `mock` | `pending` | `AI_FALLBACK_USED` |
| Output inválido tras retry | `false` | `openai` | `failed` | `AI_INVALID_OUTPUT_SCHEMA` |
| Anthropic invocado (stub) | `false` | `anthropic` | `failed` | `AI_PROVIDER_NOT_CONFIGURED` |

`timeout_ms` se persiste con el valor aplicado (default 60 000) para auditoría histórica si se modifica la configuración global.

### 21.5 Trazabilidad y privacidad

- `input_payload` debe sanitizar PII (emails, IDs personales): el constructor de input excluye explícitamente datos sensibles.
- `correlation_id` permite cruzar con logs estructurados sin necesidad de duplicar payloads.
- Las consultas IA del admin (auditoría global) leen sólo metadata por defecto; el payload completo requiere endpoint dedicado y auditoría adicional (`AdminAction`).

### 21.6 Seed y mock support

- `mock` es funcional MVP: produce salidas deterministas keyed por `(feature, event_type_code, language_code)`. Las salidas seed van con `is_seed=true` y `llm_provider='mock'`.
- `anthropic` es stub no funcional: el seed no incluye recomendaciones con este provider.

---

## 22. Estrategia JSONB

| Tabla | Campo JSONB | Justificación | Restricciones |
|---|---|---|---|
| `ai_recommendations` | `input_payload`, `output_payload`, `validated_output_payload` | Estructura variable por feature; validación con Zod. | No se filtra por contenido en MVP. |
| `quote_requests` | `brief` | Brief estructurado (tipo, fecha, ciudad, invitados, notas). | Filtros se aplican sobre columnas, no contenido JSON. |
| `quotes` | `breakdown` | Desglose simple por concepto. | No se filtra por contenido. |
| `notifications` | `payload` | Datos contextuales del aviso. | Lectura para render UI. |
| `admin_actions` | `metadata` | Snapshot pre/post. | Auditoría exclusivamente. |
| `event_types` | `display_name`, `description` | i18n. | Lectura por idioma en aplicación. |
| `service_categories` | `display_name` | i18n. | — |
| `attachments` | (no JSONB) | Metadata en columnas explícitas. | — |

### 22.1 Reglas duras JSONB

- **No reemplaza columnas filtrables.** Si un atributo se usa para filtrar, ordenar o autorizar, va a columna explícita.
- **No persiste secretos.** Tokens, contraseñas, captcha secrets nunca van en JSONB.
- **Validado en aplicación.** Cada JSONB tiene su Zod schema en la capa de servicio.
- **Sin índices GIN en MVP.** Si se requiere búsqueda dentro de JSON, se evalúa como ADR posterior.

---

## 23. Enums físicos requeridos

Tipos PostgreSQL nativos. Prisma los declara como `enum`.

| Enum | Valores | Tabla(s) que lo usan |
|---|---|---|
| `user_role` | `organizer`, `vendor`, `admin` | `users.role` |
| `user_status` | `active`, `suspended` | `users.status` |
| `language_code` | `es-LATAM`, `es-ES`, `pt`, `en` | múltiples |
| `currency_code` | `GTQ`, `EUR`, `MXN`, `COP`, `USD` | múltiples |
| `event_type_code` | `wedding`, `xv`, `baptism`, `baby_shower`, `birthday`, `corporate` | `events`, `event_types` |
| `event_status` | `draft`, `active`, `completed`, `cancelled` | `events.status` |
| `task_status` | `pending`, `in_progress`, `done`, `skipped` | `event_tasks.status` |
| `vendor_status` | `pending`, `approved`, `rejected`, `hidden` | `vendor_profiles.status` |
| `subscription_status` | `active`, `inactive` | `vendor_profiles.subscription_status` |
| `quote_request_status` | `sent`, `viewed`, `responded`, `expired`, `cancelled` | `quote_requests.status` |
| `quote_status` | `draft`, `sent`, `accepted`, `rejected`, `expired` | `quotes.status` |
| `booking_intent_status` | `pending`, `confirmed_intent`, `cancelled` | `booking_intents.status` |
| `booking_cancelled_by` | `organizer`, `vendor`, `system` | `booking_intents.cancelled_by` |
| `review_status` | `published`, `hidden`, `removed` | `reviews.status` |
| `notification_type` | `quote_request_received`, `quote_received`, `quote_rejected`, `quote_expired`, `task_due_soon`, `booking_confirmed`, `booking_cancelled`, `review_received`, `vendor_approved`, `vendor_rejected` | `notifications.type` |
| `notification_channel` | `in_app`, `email_simulated` | `notifications.channel` |
| `notification_status` | `unread`, `read` | `notifications.status` |
| `ai_recommendation_type` | `event_plan`, `checklist`, `budget_suggestion`, `vendor_categories`, `quote_brief`, `quote_comparison`, `vendor_bio`, `task_prioritization` | `ai_recommendations.type`, `ai_prompt_versions.feature_type` |
| `ai_recommendation_status` | `pending`, `accepted`, `rejected`, `discarded`, `failed`, `expired` | `ai_recommendations.status` |
| `llm_provider` | `openai`, `mock`, `anthropic` | `ai_recommendations.llm_provider` |
| `prompt_version_status` | `draft`, `reviewed`, `approved`, `active`, `deprecated`, `archived` | `ai_prompt_versions.status` |
| `attachment_owner_type` | `vendor_profile`, `vendor_work`, `quote_request` | `attachments.owner_type` |
| `attachment_status` | `active`, `deleted` | `attachments.status` |
| `admin_action_type` | `approve_vendor`, `reject_vendor`, `hide_vendor`, `hide_review`, `remove_review`, `create_category`, `update_category`, `deactivate_category`, `move_category`, `create_event_type`, `update_event_type`, `activate_event_type`, `deactivate_event_type`, `view_event`, `vendor_category_change`, `hide_attachment`, `remove_attachment`, `manage_seed_user`, `run_seed` | `admin_actions.action` |

### 23.1 Gestión segura de cambios de enum

- **Agregar valor:** `ALTER TYPE <enum> ADD VALUE 'nuevo';` se ejecuta como raw SQL en una migración Prisma. PostgreSQL no permite remover ni renombrar valores in-place.
- **Renombrar valor:** crear nuevo enum, migrar datos, hacer swap, eliminar enum viejo. Operación rara; requiere ADR.
- **Remover valor:** mismo proceso que rename. Sólo si el valor nunca fue usado.

---

## 24. Constraints e invariantes de negocio

Tabla consolidada con los constraints físicos derivados del DDM (§17) y de los addendums:

| ID | Tabla | Regla | Mecanismo físico | Fuente |
|---|---|---|---|---|
| C-001 | `users` | Email único case-insensitive | `uq_users_email_lower ON (LOWER(email))` | BR-USER-002 |
| C-002 | `users` | Rol válido | `enum user_role` | BR-AUTH-005 |
| C-003 | `users` | Admin no se crea por registro público | Service layer + ausencia de endpoint público | BR-AUTH-002 |
| C-004 | `events` | Owner es organizer | FK + check de rol en service | BR-EVENT-001 |
| C-005 | `events` | Tipo en catálogo | `enum event_type_code` | BR-EVENTTYPE-001 |
| C-006 | `events` | Transiciones de estado | Service layer + enum | BR-EVENT-005 |
| C-007 | `events`/`quote_requests` | Solo eventos `active` cotizan | Service layer | BR-EVENT-006 |
| C-008 | `events` | `currency_code` inmutable post-creación | Service layer (rechazo en PATCH) | BR-EVENT-007 |
| C-009 | `events` | `guests_count >= 1` | CHECK | derived |
| C-010 | `events` | `estimated_budget >= 0` | CHECK | derived |
| C-015 | `budgets` | 1:1 con `event_id` | UNIQUE `(event_id)` | BR-BUDGET-001 |
| C-016 | `budgets` | Misma moneda que `events` | Service layer | BR-BUDGET-006 |
| C-017 | `budget_items` | Montos no negativos | CHECK `planned >= 0 AND committed >= 0 AND paid >= 0` | derived |
| C-019 | `vendor_profiles` | 1:1 con `users` | UNIQUE `(user_id)` | BR-AUTH-007 |
| C-020 | `vendor_profiles` | Visibilidad por status | Service layer (queries públicas con `status='approved'`) | BR-VENDOR-001 |
| C-022 | `attachments` | ≤ 10 imágenes por trabajo | Service layer (`COUNT(*) < 10` antes de INSERT) | BR-VENDOR-005 |
| C-022b | `vendor_profiles` | `category_change_count <= 5` | CHECK + service layer | BR-VENDOR-004 |
| C-026b | `service_categories` | Profundidad máxima 2 | CHECK `depth_level BETWEEN 1 AND 2` + service layer | BR-SERVICE-005 |
| C-026c | `event_types` | Sin hard delete con eventos | Service layer (DELETE rechaza si referenciado) | BR-EVENTTYPE-007 |
| C-027 | `quote_requests` | Una activa por (event, vendor) | Unique parcial | BR-QUOTE-004 |
| C-027b | `quote_requests` | Max 5 activas por (event, category) | Service layer transaccional | BR-QUOTE-009 |
| C-029 | `quote_requests` | `brief` no vacío | Service layer (Zod schema) | BR-QUOTE-002 |
| C-030 | `quotes` | Una vigente por request | Unique parcial | BR-QUOTE-013 |
| C-031 | `quotes` | `valid_until` default 15 días | Service layer + opcional `DEFAULT` en motor | BR-QUOTE-015 |
| C-032 | `quotes` | `valid_until` pasado ⇒ `expired` | Job programado | BR-QUOTE-016 |
| C-034 | `quotes` | Moneda heredada del evento | Service layer | BR-QUOTE-019 |
| C-037 | `booking_intents` | Único `confirmed_intent` por (event, category) | Unique parcial | BR-BOOKING-007 |
| C-038 | `booking_intents` | `is_simulated = true` | CHECK `is_simulated = true` | BR-BOOKING-004 |
| C-039 | `reviews` | Verificación por `confirmed_intent` | Service layer | BR-REVIEW-001 |
| C-040 | `reviews` | Única por (event, vendor) | UNIQUE | BR-REVIEW-002 |
| C-041 | `reviews` | Rating 1–5 entero | CHECK `rating BETWEEN 1 AND 5` | BR-REVIEW-003 |
| C-043 | `reviews` | Soft delete obligatorio con auditoría | Status enum + `admin_action_id` | BR-REVIEW-005 |
| C-046 | `ai_recommendations` | `accepted` default false | DEFAULT `false` | BR-AI-007 |
| C-047 | `ai_recommendations` | Referencia obligatoria a prompt version | FK NOT NULL | BR-AI-010 |
| C-048 | `ai_recommendations` | Idioma coherente | Service layer | BR-AI-011 |
| C-049 | `event_tasks`/`budget_items` | `ai_generated=true` al aceptar | Service layer (transacción) | BR-AI-008 |
| C-050 | `admin_actions` | Append-only | Convención + revocar UPDATE/DELETE al rol app (opcional) | BR-ADMIN-004 |
| C-052 | `attachments` | Owner válido | Service layer | derived |
| C-053 | (todas) | Sin tipo de cambio | Ausencia de tabla | BR-OOS-015 |
| C-055 | (todas) | Sin medios de pago | Ausencia de tabla / campos | BR-OOS-001 |
| C-056 | `events` | Cierre automático +2 días | Job + columnas `completed_at`, `auto_completed` | BR-EVENT-013 |
| C-057 | `booking_intents` | Cancelación sin penalización | Columnas `cancelled_by`, `cancelled_at`, `cancellation_reason` | BR-BOOKING-009 |
| C-058 | `ai_recommendations` | Timeout 60 000 ms | `timeout_ms` default 60000 + service layer | BR-AI-009 |
| C-059 | `users` (auth) | Captcha obligatorio | Middleware; no se persiste secreto | BR-AUTH-011 |
| C-060 | `attachments` | Soft delete con auditoría | Enum + columnas `deleted_*` | BR-PRIVACY-011 |
| C-061 | `notifications` | Aviso a vendor en reject/expire | Service layer (creación al transicionar) | BR-NOTIF-002 |
| C-062 | `ai_recommendations` | Anthropic no funcional MVP | Enum acepta `anthropic`; provider lanza error | BR-AI-005 |

---

## 25. Índices físicos

Catálogo query-driven derivado de `/docs/16-API-Design-Specification.md` y de los casos de uso (`/docs/8-Use-Cases-Specification.md`).

| Índice | Tabla | Columnas | Tipo | Caso de uso |
|---|---|---|---|---|
| `uq_users_email_lower` | `users` | `LOWER(email)` | unique funcional | Login. |
| `idx_users_role_status` | `users` | `(role, status)` | btree | Admin lista usuarios. |
| `idx_events_owner_status_date` | `events` | `(owner_id, status, event_date)` | btree | `GET /events?status&eventDate*`. |
| `idx_events_auto_complete_candidates` | `events` | `(event_date) WHERE status='active'` | parcial | Job cierre automático. |
| `idx_event_tasks_event_status` | `event_tasks` | `(event_id, status)` | btree | Checklist UI. |
| `idx_budget_items_budget_id` | `budget_items` | `(budget_id)` | btree | Detalle presupuesto. |
| `uq_vendor_profiles_user_id` | `vendor_profiles` | `(user_id)` | unique | 1:1. |
| `idx_vendor_profiles_status_location` | `vendor_profiles` | `(status, location_id) WHERE status='approved'` | parcial | Directorio público. |
| `idx_vendor_profiles_status` | `vendor_profiles` | `(status)` | btree | Cola admin. |
| `idx_vendor_services_active` | `vendor_services` | `(vendor_profile_id) WHERE is_active=true` | parcial | Servicios activos. |
| `idx_service_categories_active` | `service_categories` | `(is_active) WHERE is_active=true` | parcial | Selector de categoría. |
| `uq_quote_requests_event_vendor_active` | `quote_requests` | `(event_id, vendor_profile_id) WHERE status IN (...)` | unique parcial | C-027. |
| `idx_quote_requests_event_category_active` | `quote_requests` | `(event_id, service_category_id) WHERE status IN (...)` | parcial | Conteo C-027b. |
| `idx_quote_requests_vendor_status` | `quote_requests` | `(vendor_profile_id, status)` | btree | Bandeja vendor. |
| `uq_quotes_request_active` | `quotes` | `(quote_request_id) WHERE status NOT IN ('expired','rejected')` | unique parcial | C-030. |
| `idx_quotes_valid_until_active` | `quotes` | `(valid_until) WHERE status='sent'` | parcial | Job expiración. |
| `uq_booking_intents_event_category_confirmed` | `booking_intents` | `(event_id, service_category_id) WHERE status='confirmed_intent'` | unique parcial | C-037. |
| `idx_booking_intents_event_id` | `booking_intents` | `(event_id)` | btree | — |
| `idx_booking_intents_vendor_id` | `booking_intents` | `(vendor_profile_id)` | btree | Bandeja vendor. |
| `uq_reviews_event_vendor` | `reviews` | `(event_id, vendor_profile_id)` | unique | C-040. |
| `idx_reviews_vendor_status_published` | `reviews` | `(vendor_profile_id) WHERE status='published'` | parcial | Directorio. |
| `idx_notifications_user_status_sent` | `notifications` | `(user_id, status, sent_at DESC)` | btree | Bandeja. |
| `idx_notifications_user_unread` | `notifications` | `(user_id) WHERE status='unread'` | parcial | Badge UI. |
| `idx_attachments_owner` | `attachments` | `(owner_type, owner_id, status)` | btree | Listado polimórfico. |
| `idx_attachments_vendor_work_active` | `attachments` | `(owner_id, work_label) WHERE owner_type='vendor_work' AND status='active'` | parcial | Límite 10 (C-022). |
| `idx_admin_actions_admin_created` | `admin_actions` | `(admin_id, created_at DESC)` | btree | Auditoría por admin. |
| `idx_admin_actions_target` | `admin_actions` | `(target_type, target_id)` | btree | Auditoría por recurso. |
| `idx_ai_rec_user_created` | `ai_recommendations` | `(requested_by_user_id, created_at DESC)` | btree | Historial. |
| `idx_ai_rec_event_type_created` | `ai_recommendations` | `(event_id, type, created_at DESC)` | btree | Sugerencias por evento. |
| `idx_ai_rec_status_created` | `ai_recommendations` | `(status, created_at DESC)` | btree | Auditoría admin. |
| `idx_ai_rec_provider_created` | `ai_recommendations` | `(llm_provider, created_at DESC)` | btree | Métricas. |
| `idx_ai_rec_correlation_id` | `ai_recommendations` | `(correlation_id)` | btree | Cruce con logs. |
| `idx_ai_rec_prompt_version` | `ai_recommendations` | `(prompt_version_id)` | btree | Auditoría PromptOps. |
| `idx_ai_rec_pending_expires` | `ai_recommendations` | `(expires_at) WHERE status='pending'` | parcial | Job expiración. |
| `uq_prompt_versions_active` | `ai_prompt_versions` | `(prompt_id) WHERE status='active'` | unique parcial | Una activa por prompt. |
| `idx_*_is_seed` | (todas las operativas) | `(is_seed) WHERE is_seed=true` | parcial | Reset seed. |

### 25.1 Política de creación

- Toda lista pública o de bandeja con paginación obtiene índice compuesto `(filtro_principal, created_at DESC)` o `(filtro, status, sort_key)`.
- Los unique parciales son **mandatorios** para los casos donde la regla de negocio depende del estado.
- Índices GIN/GIST sólo se evalúan si MVP detecta latencia crítica en búsqueda libre del directorio; out of scope inicial.

---

## 26. Estrategia de soft delete

| Tabla | Mecanismo | Filtro estándar | Auditoría |
|---|---|---|---|
| `reviews` | `status IN ('hidden','removed')` | Queries públicas: `status='published'`. | `moderated_by`, `moderated_at`, `moderation_reason`, `admin_action_id`. |
| `attachments` | `status='deleted'` con `deleted_at`, `deleted_by` | `status='active'`. | `deletion_reason`, eventual `admin_action_id` si moderación admin. |
| `service_categories` | `is_active=false` | `is_active=true`. | `AdminAction`. |
| `event_types` | `is_active=false`, `deactivated_at`, `deactivated_by` | `is_active=true`. | `AdminAction`. |
| `vendor_profiles` | `status='hidden'` (no `removed`) | `status='approved'` en directorio. | `AdminAction`. |
| `vendor_services` | `is_active=false` | `is_active=true`. | — |
| `locations` | `is_active=false` | `is_active=true`. | — |

### 26.1 Implementación uniforme

- Cada tabla con soft delete tiene índice parcial `WHERE <filtro de visibilidad>` para queries comunes.
- El borrado físico está prohibido en operación normal. La eliminación física solo procede para datos seed (`DELETE WHERE is_seed=true`) o por migración correctiva con ADR.
- Las FK que apuntan a tablas con soft delete usan `ON DELETE RESTRICT` para forzar la disciplina.

### 26.2 No se aplica soft delete a

- `users` (suspensión vía `status='suspended'`, no eliminación).
- `events` (cancelación vía `status='cancelled'`).
- `quote_requests`, `quotes`, `booking_intents` (estados terminales propios).
- `notifications` (transitorias, eliminables vía retention si se requiere).
- `admin_actions` (append-only; no se elimina).
- `ai_recommendations` (status `discarded`/`expired` cubre el caso).

---

## 27. Estrategia de seed data

### 27.1 Mecanismo

- Toda tabla operativa lleva `is_seed boolean NOT NULL DEFAULT false`.
- Reset surgical: `DELETE FROM <tabla> WHERE is_seed = true`, en orden inverso de dependencias FK.
- Idempotencia: re-ejecución del script produce el mismo dataset (UUIDs deterministas para fixtures clave).

### 27.2 Determinismo

- Los UUIDs de fixtures (admin seed, evento estrella, vendors demo, prompt versions) están **hardcoded** en el código de seed.
- Otros registros generados en lote (notificaciones, attachments) pueden usar UUID v4 aleatorio, ya que el `DELETE WHERE is_seed=true` los limpia indistinctly.
- `MockAIProvider` produce salidas deterministas keyed por `(feature, event_type_code, language_code)`.

### 27.3 Guardas de entorno

- El script de seed **rechaza ejecución** si `NODE_ENV=production` salvo flag explícita (`SEED_ALLOW_PROD=true`), nunca activada por defecto.
- En CI/QA se ejecuta `seed:qa` con dataset reducido.
- En demo se ejecuta `seed:demo` con dataset completo descrito en `/docs/11-Data-Seed-Strategy.md`.

### 27.4 Constraints y consideraciones

- Emails seed con dominio convencional `@eventflow.demo` para evitar colisión con usuarios reales.
- `is_seed=true` no altera las constraints de negocio (rating 1–5, quote validity, etc.): seed debe respetarlas.
- Cada ejecución de seed genera registros `admin_actions` (`action='run_seed'`, `is_seed=true`) para trazabilidad.

### 27.5 Índices de soporte

- Todas las tablas operativas: `idx_<tabla>_is_seed (is_seed) WHERE is_seed = true`.
- Permite reset rápido sin escaneo completo.

---

## 28. Estrategia de migraciones Prisma

### 28.1 Naming y orden

- Cada migración tiene formato `YYYYMMDDHHMMSS_<descripcion_kebab>`.
- La migración inicial se nombra `20260601000000_init`.
- Migraciones posteriores describen el cambio: `20260620120000_add_ai_recommendations_validated_payload`.

### 28.2 Tipos de migración

| Tipo | Estrategia |
|---|---|
| Crear tabla | Migración Prisma estándar. |
| Crear enum nuevo | Migración Prisma. |
| Agregar valor a enum existente | `ALTER TYPE <enum> ADD VALUE 'nuevo'` en raw SQL anexada. |
| Agregar columna nullable | Migración Prisma directa. |
| Agregar columna NOT NULL | Pasos: 1) columna nullable + default, 2) backfill, 3) `ALTER COLUMN SET NOT NULL`. Multi-step. |
| Agregar índice | Migración Prisma (`@@index`) o raw SQL para parciales/funcionales. |
| Agregar unique parcial | Raw SQL en migración Prisma. |
| Agregar check constraint | Raw SQL en migración Prisma. |
| Renombrar columna/tabla | Multi-step con vistas temporales si la app está activa; en MVP típicamente downtime corto aceptable. |
| Remover columna | Migración Prisma con baja: requiere despliegue previo del backend sin referenciar la columna. |

### 28.3 Raw SQL policy

Las migraciones raw SQL se documentan inline con comentarios `-- Raw SQL: <motivo>`. Los casos válidos:

1. Unique parciales (`WHERE ...`).
2. Check constraints.
3. Índices funcionales (`LOWER(email)`).
4. Cambios de enum.
5. Backfills.

### 28.4 Rollback

- Migraciones **forward-only** en producción.
- El rollback se aborda con una migración correctiva (forward), nunca revirtiendo en motor.
- En desarrollo se permite `prisma migrate reset` (destructivo).

### 28.5 Checklist de revisión por migración

- [ ] ¿Es backward-compatible con la versión previa del backend?
- [ ] ¿Requiere backfill? Si sí, ¿está scriptado?
- [ ] ¿Agrega constraints sobre datos existentes? Si sí, ¿se validó la coherencia previa?
- [ ] ¿Impacta índices críticos? Si sí, ¿se crea con `CONCURRENTLY` (raw SQL)?
- [ ] ¿Hay tests de integración que cubren el cambio?
- [ ] ¿Se actualizó la documentación de schema?

---

## 29. Transacciones y consistencia

Operaciones que **requieren ejecución transaccional** (`prisma.$transaction`):

| Caso de uso | Entidades afectadas | Razón |
|---|---|---|
| `RegisterUserUseCase` | `users` (+ `notifications` welcome opcional) | Unicidad email + creación atómica. |
| `CreateEventUseCase` | `events` + `budgets` | Un evento sin budget es estado inválido (BR-BUDGET-001). |
| `AcceptAIChecklistUseCase` | `ai_recommendations` + `event_tasks[]` | Aceptar IA sin materializar = inconsistencia. |
| `AcceptAIBudgetUseCase` | `ai_recommendations` + `budget_items[]` | Idem. |
| `AcceptAIBriefUseCase` | `ai_recommendations` + `quote_requests` | Aplicar brief a la solicitud. |
| `AcceptAIVendorBioUseCase` | `ai_recommendations` + `vendor_profiles`/`vendor_services` | Aplicar bio. |
| `CreateQuoteRequestUseCase` | `quote_requests` (recount + insert) | Límite 5 activas por categoría (C-027b). Aislamiento mínimo `REPEATABLE READ`. |
| `RespondToQuoteRequestUseCase` | `quote_requests` + `quotes` + `notifications` | Coherencia + aviso. |
| `RejectQuoteUseCase` | `quotes` + `notifications` | C-061. |
| `ExpireQuotesJob` | `quotes` + `notifications` | Idempotente; corre cada ejecución. |
| `AcceptQuoteUseCase` | `quotes` + `booking_intents` + `notifications` | Aceptación crea booking pending. |
| `ConfirmBookingIntentUseCase` | `booking_intents` + `budget_items.committed` + `notifications` | Actualización de committed atómica. |
| `CancelBookingIntentUseCase` | `booking_intents` + `budget_items.committed` (revert) + `notifications` | C-057. |
| `CreateReviewUseCase` | `reviews` + `vendor_profiles.rating_avg/reviews_count` + `notifications` | Promedio coherente. |
| `HideOrRemoveReviewUseCase` (admin) | `reviews` + `admin_actions` + `vendor_profiles.rating_avg` | Auditoría + recálculo. |
| `ApproveVendorProfileUseCase` | `vendor_profiles` + `admin_actions` + `notifications` | Auditoría. |
| `RejectVendorProfileUseCase` | `vendor_profiles` + `admin_actions` + `notifications` | Idem. |
| `DeactivateEventTypeUseCase` | `event_types` + `admin_actions` | Soft delete + auditoría. |
| `SeedDemoDataUseCase` / `ResetDemoUseCase` | múltiples | Coherencia del dataset. |
| `AutoCompleteEventsJob` | `events` (set `status='completed'`, `auto_completed=true`, `completed_at`) | Idempotente. |

### 29.1 Aislamiento

- **Default Prisma:** `READ COMMITTED`.
- **`CreateQuoteRequestUseCase` y `ConfirmBookingIntentUseCase`:** elevar a `REPEATABLE READ` para evitar phantom reads en el recount.
- **`SERIALIZABLE`** se evalúa como optimización futura sólo si se detecta race en producción.

### 29.2 Sin locks pessimistas

- El MVP **no usa `SELECT ... FOR UPDATE`** explícito. La consistencia se logra con transacciones cortas + unique parciales.
- Si una operación lanza violación de unique (carrera detectada), el servicio responde 409 Conflict.

---

## 30. Riesgos físicos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Trazabilidad IA débil | Imposible reproducir salidas, debugging difícil | `ai_recommendations` con FK a `ai_prompt_versions`, `correlation_id`, `input/output_payload` JSONB, `template_hash`. |
| Sobreuso de JSONB | Performance, pérdida de constraints | §22 reglas duras; columnas explícitas para todo lo filtrable. |
| Índices de ownership faltantes | Latencia en bandejas y listados | §25 incluye índices por owner/status para cada tabla operativa. |
| Migración dolorosa de enums | Cambios bloqueantes | §23.1 política de `ADD VALUE` + ADR para rename/remove. |
| Soft delete inconsistente | Datos "fantasmas" visibles | Índices parciales `WHERE status=visible`, queries siempre con filtro de status; revisión de PR obligatoria. |
| Drift entre seed y schema | Seed que falla tras migración | CI ejecuta `seed:qa` al final de cada build; checklist post-migración (§28.5). |
| Sobre-modelar features futuras | Schema rígido | §33 exclusiones explícitas + revisión de PR. |
| Race en `quote_requests` (5 activas) | Sobrepasa el límite | `REPEATABLE READ` + service-layer recount + unique parcial. |
| Race en `booking_intents.confirmed_intent` | Doble confirmación por categoría | Unique parcial C-037. |
| Pérdida de auditoría de reviews | Compliance issue | `admin_action_id` + soft delete + check lógico en service. |
| `is_seed` mal aplicado en producción | Borrado accidental | `SEED_ALLOW_PROD=false` por defecto + tests en CI. |

---

## 31. Consideraciones de seguridad y privacidad

| Aspecto | Decisión física |
|---|---|
| Contraseñas | `users.password_hash` con bcrypt/argon2. Nunca plaintext. |
| Captcha | Sin persistencia de secretos (BR-AUTH-011). |
| PII | Mínimos: email, nombre, teléfono opcional. Sin documentos legales (BR-OOS-010). |
| Datos de pago | **Ausencia total de tablas** y columnas que persistan medios de pago (BR-OOS-001). |
| Tokens / sesiones | JWT en MVP; sin tabla de sesiones. Si se introduce refresh-token persistente, ADR aparte. |
| AI input minimization | `input_payload` sanitizado: sin emails, IDs, tokens. |
| Logs vs DB | Datos sensibles solo en logs estructurados temporales (no en columnas persistentes). |
| `correlation_id` | Identificador opaco que permite cruzar DB con logs sin duplicar payloads. |
| Ownership en el schema | Cada recurso lleva FK a su owner; backend aplica autorización ANTES de cualquier query. |
| Encriptación at-rest | Delegada al proveedor cloud (RDS/Cloud SQL); no se implementa columna-level encryption en MVP. |
| Retention de auditoría | `admin_actions` y `ai_recommendations` se conservan indefinidamente en MVP; política formal en ADR posterior. |
| Backup | Responsabilidad de DevOps (NFR); el schema no asume backup table-level. |

---

## 32. Consideraciones de performance MVP

| Aspecto | Decisión |
|---|---|
| Escala esperada | < 100 organizadores, < 200 proveedores, < 500 eventos, < 5 000 cotizaciones, < 10 000 notificaciones, < 20 000 `ai_recommendations` (estimación 6–12 meses). |
| Particionado | **No** se introduce. Tablas pequeñas no lo requieren. |
| Materialized views | **No**. Métricas admin se computan on-demand con LIMIT y caché de capa de servicio. |
| Read replicas | Out of scope MVP. |
| Conexiones | Pool Prisma; max ~ 20 conexiones por instancia. |
| Paginación | Page-based (`page`, `pageSize`) según `/docs/16-API-Design-Specification.md §16.1`. Índices compuestos `(filtro, created_at DESC)` para consistencia de ordenamiento. |
| Búsqueda en directorio vendor | Indexación trigram opcional (`pg_trgm`) sobre `business_name`. Se evalúa tras medir latencia real. |
| Admin dashboard | Queries directas con `COUNT(*)` y `GROUP BY` sobre tablas pequeñas; sin agregaciones precomputadas. |
| Job de expiración de quotes | Diario, idempotente, sobre índice parcial. |
| Job de cierre de eventos | Diario, sobre índice parcial `(event_date) WHERE status='active'`. |

---

## 33. Exclusiones explícitas del modelo físico MVP

Las siguientes estructuras **no existen** en el schema:

| Estructura excluida | Razón | Fuente |
|---|---|---|
| `payments`, `invoices`, `payment_methods` | Sin pagos reales. | BR-OOS-001, BR-PRIVACY-006 |
| `commissions` | Sin comisiones. | BR-OOS-002 |
| `contracts`, `digital_signatures` | Sin contratos. | BR-OOS-003 |
| `conversations`, `messages` | Sin chat real-time. | BR-OOS-006 |
| `whatsapp_messages` | Sin WhatsApp. | BR-OOS-004 |
| `sms_messages` | Sin SMS. | BR-OOS-017 |
| `push_devices`, `push_notifications` | Sin push nativo. | BR-OOS-005, BR-OOS-017 |
| `calendar_integrations`, `external_calendars` | Sin Google/Outlook. | BR-FUTURE-020 |
| `guests`, `rsvps`, `seating_plans` | Sin invitados/mesas. | BR-OOS-014 |
| `vendor_kyc_documents` | Sin KYC automatizado. | BR-OOS-009 |
| `tax_documents` | Sin facturación electrónica. | BR-OOS-010 |
| `exchange_rates` | Sin conversión de moneda. | BR-OOS-015, BR-BUDGET-007 |
| `ai_moderation_results` | Sin moderación IA automática. | BR-OOS-008 |
| `sentiment_analysis_results` | Sin análisis de sentimiento. | BR-OOS-007 |
| `embeddings`, `vector_store` | Sin RAG/vector DB. | Out of Scope AI |
| `subscription_plans`, `premium_vendor_plans` | Sin suscripción real. | BR-FUTURE-018/019 |
| `event_collaborators` | Sin multi-colaboradores. | BR-FUTURE-002 |
| `vendor_responses_to_reviews` | Sin respuesta del proveedor. | BR-REVIEW-008 |
| `notification_delivery_log` | Cubierto por `notifications` + logs estructurados. | Decisión simplificación. |
| `audit_log` general | Cubierto por `admin_actions` + columnas `*_by`/`*_at`. | Decisión simplificación. |
| `idempotency_keys` | No mandatorio MVP (no marcado en `/docs/16`). | Out of scope MVP. |
| `refresh_tokens` / `sessions` | JWT sin persistencia. Si futuro persistente, ADR. | Decisión MVP. |

---

## 34. ADRs o decisiones pendientes

Sólo se listan decisiones que requieren resolución antes de implementar.

| ADR | Decisión a tomar | Recomendación inicial |
|---|---|---|
| ADR-DB-001 | `ai_prompt_versions` como tabla o sólo código | **Híbrido** (tabla + código) — recomendado en §21.2. Confirmar antes de generar la migración inicial. |
| ADR-DB-002 | Indexación trigram para búsqueda directorio | Diferida; introducir si latencia real lo requiere. |
| ADR-DB-003 | Política de retention de `ai_recommendations` y `notifications` | Diferida; evaluar tras 6 meses de operación. |
| ADR-DB-004 | `REVOKE UPDATE, DELETE ON admin_actions` al rol de aplicación | Opcional; no bloquea MVP. |
| ADR-DB-005 | Uso de `citext` vs índice funcional `LOWER(email)` | Recomendado índice funcional para evitar extensión adicional. |

---

## 35. Checklist de readiness para implementación

### 35.1 Prisma schema
- [ ] Todos los modelos del §11 declarados con `@@map` y `@map`.
- [ ] Enums declarados (§23) y mapeados.
- [ ] FK declaradas con `@relation` y políticas `onDelete` correctas.
- [ ] Soft delete con columnas `deleted_at`, `deleted_by`, `status` según §26.
- [ ] `is_seed` en todas las tablas operativas.

### 35.2 Migraciones
- [ ] Migración baseline `20260601000000_init` generada.
- [ ] Raw SQL anexada para: unique parciales, check constraints, índice funcional email, default `valid_until`.
- [ ] Backfill scripts para columnas NOT NULL agregadas posteriormente (cuando aplique).

### 35.3 Constraints
- [ ] CHECK `rating BETWEEN 1 AND 5` aplicada.
- [ ] CHECK `depth_level BETWEEN 1 AND 2` aplicada.
- [ ] CHECK `is_simulated = true` en `booking_intents`.
- [ ] CHECK `timeout_ms > 0` en `ai_recommendations`.
- [ ] CHECK `category_change_count <= 5` en `vendor_profiles`.

### 35.4 Índices
- [ ] Todos los índices del §25 creados.
- [ ] Índices `is_seed` parciales en todas las tablas operativas.

### 35.5 Seed
- [ ] Script `prisma/seed.ts` implementado con UUIDs deterministas para fixtures críticos.
- [ ] `seed:demo` y `seed:qa` distinguibles.
- [ ] Guardas `NODE_ENV` aplicadas.

### 35.6 IA
- [ ] `ai_recommendations` con todas las columnas del §21.1.
- [ ] `ai_prompt_versions` registrada con `template_hash` y `status='active'` único.
- [ ] `MockAIProvider` genera salidas deterministas para seed.

### 35.7 Soft delete
- [ ] Queries públicas filtran por status visible.
- [ ] Tests de integración que verifican que registros soft-deleted no aparecen en listados públicos.

### 35.8 Tests
- [ ] Tests de unicidad parcial (5 active quote requests, único confirmed_intent, etc.).
- [ ] Tests de rating range.
- [ ] Tests de inmutabilidad de `currency_code`.
- [ ] Tests del job de cierre automático de eventos.
- [ ] Tests del job de expiración de quotes.

### 35.9 Documentación
- [ ] Diagrama ER actualizado.
- [ ] CHANGELOG de cada migración con motivo.

---

## 36. Matriz de trazabilidad

| Tabla física | Entidad lógica (DDM §11) | Reglas (BR-*) / Decisiones | API (doc 16) | Backend (doc 14) | Seed (doc 11) | NFR (doc 10) |
|---|---|---|---|---|---|---|
| `users` | User | BR-USER-001/002/006, BR-AUTH-001/002/005/011 | `/auth/*`, `/users/me` | RegisterUserUseCase, AuthenticateUserUseCase | SEED-USER-001..003 | NFR-SEC-005, PRIV-002 |
| `events` | Event | BR-EVENT-001..013 | `/events` | CreateEventUseCase, AutoCompleteEventsJob | SEED-EVENT-001 | NFR-DATA-001/003 |
| `event_types` | EventType | BR-EVENTTYPE-001..007 | `/admin/event-types` | DeactivateEventTypeUseCase | SEED-EVENTTYPE-001 | — |
| `event_tasks` | EventTask | BR-TASK-001..010, BR-AI-008 | `/events/:id/tasks` | AcceptAIChecklistUseCase | SEED-TASK-001 | — |
| `budgets` | Budget | BR-BUDGET-001/003/006 | `/events/:id/budget` | CreateEventUseCase | SEED-BUDGET-001 | — |
| `budget_items` | BudgetItem | BR-BUDGET-002/005/008 | `/events/:id/budget/items` | AcceptAIBudgetUseCase, ConfirmBookingIntent | — | — |
| `vendor_profiles` | VendorProfile | BR-VENDOR-001..010 | `/vendors`, `/admin/vendors` | ApproveVendorProfile, RejectVendorProfile | SEED-VENDOR-001..004 | — |
| `vendor_services` | VendorService | BR-SERVICE-001..002/006 | `/vendors/me/services` | — | — | — |
| `service_categories` | ServiceCategory | BR-SERVICE-003..007, BR-ADMIN-012 | `/admin/service-categories` | — | SEED-CATEGORY-001 | — |
| `locations` | Location | BR-EVENT-003, BR-VENDOR-002 | `/locations` | — | SEED-LOCATION-001 | — |
| `quote_requests` | QuoteRequest | BR-QUOTE-001..010 | `/quote-requests` | CreateQuoteRequestUseCase | SEED-QUOTE-001 | NFR-DATA-004 |
| `quotes` | Quote | BR-QUOTE-011..024 | `/quotes` | RespondToQuoteRequest, RejectQuote, ExpireQuotesJob | SEED-QUOTE-001 | NFR-DATA-006 |
| `booking_intents` | BookingIntent | BR-BOOKING-001..010 | `/booking-intents` | AcceptQuote, ConfirmBooking, CancelBooking | SEED-BOOKING-001 | — |
| `reviews` | Review | BR-REVIEW-001..010, BR-ADMIN-011 | `/reviews`, `/admin/reviews` | CreateReview, HideOrRemoveReview | SEED-REVIEW-001 | NFR-DATA-007 |
| `notifications` | Notification | BR-NOTIF-001..007 | `/notifications` | (cross-cutting) | SEED-NOTIF-001 | — |
| `attachments` | Attachment | BR-VENDOR-005, BR-PRIVACY-011 | `/attachments` | — | — | NFR-DATA-008 |
| `admin_actions` | AdminAction | BR-ADMIN-004/010/011 | `/admin/admin-actions` | (cross-cutting) | SEED-ADMIN-001 | OBS-001 |
| `ai_recommendations` | AIRecommendation | BR-AI-001..014 | `/ai-recommendations` | AcceptAI*UseCases, MockAIProvider | SEED-AI-001..002 | NFR-AI-008 |
| `ai_prompt_versions` | AIPromptVersion | BR-AI-010 | (admin internal) | PromptRegistry | SEED-PROMPT-001..008 | — |

---

## 37. Conclusión

Este Database Physical Design Document materializa el Modelo de Datos del Dominio y las decisiones técnicas posteriores en un esquema PostgreSQL + Prisma **directamente implementable**:

- Cada tabla, columna, enum, constraint e índice está trazado a su fuente.
- Las decisiones críticas (rating 1–5, validez 15 días, profundidad 2 niveles, timeout 60 000 ms, soft delete en reviews/attachments, inmutabilidad de `currency_code`, 5 cotizaciones activas por categoría) son **constraints físicos o invariantes documentadas en service layer** con respaldo de unique parciales y check constraints.
- La trazabilidad IA es **completa**: `ai_recommendations` con prompt versionado, correlation_id, lifecycle human-in-the-loop, fallback y latencia; `ai_prompt_versions` como registro híbrido garantiza integridad referencial sin convertir el MVP en un sistema enterprise de prompt management.
- El soft delete está **uniformemente aplicado** con índices parciales que evitan registros fantasmas en listados públicos.
- La estrategia seed es **surgical, determinística y blindada para producción**.
- Las migraciones siguen una política **forward-only**, multi-step para cambios incompatibles, con raw SQL acotado a unique parciales, check constraints e índices funcionales.
- El MVP **excluye explícitamente** estructuras propias de un marketplace transaccional (pagos, comisiones, contratos, chat, push, RSVP, KYC, embeddings).

El siguiente paso es **generar `prisma/schema.prisma` y la migración baseline `20260601000000_init`**, acompañada de los archivos raw SQL para constraints y unique parciales, y el script `prisma/seed.ts` con UUIDs deterministas para fixtures críticos.
