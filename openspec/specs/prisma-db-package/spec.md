# Spec: Paquete Prisma DB Compartido

> **Origen**: [`infra-prisma-shared-schema`](../../changes/archive/2026-03-02-infra-prisma-shared-schema/)  
> **Última actualización**: 2026-03-02

---

## Purpose

Define el paquete workspace `@adresles/prisma-db` como fuente única de verdad del schema Prisma para el monorepo (API, Worker). Centraliza schema, migraciones, seed y cliente generado siguiendo el patrón de paquetes compartidos (ADR-007, ADR-009).

---

## Requirements

### Requirement: Paquete prisma-db expone schema como fuente única de verdad

El paquete workspace `@adresles/prisma-db` SHALL contener el archivo `schema.prisma` como única fuente de verdad del modelo de datos Prisma para las apps que consumen PostgreSQL (API, Worker). El paquete SHALL incluir `package.json` con `name: "@adresles/prisma-db"`, `private: true` y `files: ["schema.prisma", "generated", "seed.ts", "migrations"]`. El paquete SHALL NOT incluir build step ni TypeScript.

#### Scenario: API genera cliente Prisma desde packages/prisma-db

- **WHEN** el desarrollador ejecuta `pnpm --filter api exec prisma generate` en la raíz del monorepo
- **THEN** Prisma genera el cliente en `node_modules/.prisma/client` del API usando `packages/prisma-db/schema.prisma` como schema
- **AND** no se producen errores de path ni de schema inválido

#### Scenario: Worker genera cliente Prisma desde packages/prisma-db

- **WHEN** el desarrollador ejecuta `pnpm --filter worker exec prisma generate` en la raíz del monorepo
- **THEN** Prisma genera el cliente en `node_modules/.prisma/client` del Worker usando `packages/prisma-db/schema.prisma` como schema
- **AND** no se producen errores de path ni de schema inválido

#### Scenario: Rutas de schema funcionan en Windows y Unix

- **WHEN** el desarrollador ejecuta `prisma generate` en API o Worker desde un sistema Windows
- **THEN** la ruta configurada en `prisma.schema` (p. ej. `../../packages/prisma-db/schema.prisma`) SHALL resolver correctamente el archivo
- **AND** el mismo flujo SHALL funcionar en macOS y Linux sin cambios de configuración

### Requirement: API y Worker declaran dependencia explícita

Las apps `api` y `worker` SHALL declarar `"@adresles/prisma-db": "workspace:*"` en `dependencies`. Cada app SHALL configurar `"prisma": { "schema": "<path-relativo-a-packages/prisma-db/schema.prisma>" }` en su `package.json`.

#### Scenario: pnpm install registra el workspace

- **WHEN** el desarrollador ejecuta `pnpm install` en la raíz del monorepo
- **THEN** el paquete `@adresles/prisma-db` se resuelve correctamente en los workspaces
- **AND** `pnpm list @adresles/prisma-db` en `apps/api` y `apps/worker` muestra la dependencia resuelta

#### Scenario: Turborepo detecta dependencia del schema

- **WHEN** cambia el archivo `packages/prisma-db/schema.prisma`
- **THEN** las tareas que dependen de `prisma generate` en API y Worker SHALL considerarse invalidadas (según la configuración de Turborepo y el grafo de dependencias)

### Requirement: Migraciones y seed en packages/prisma-db

Las migraciones de Prisma SHALL residir en `packages/prisma-db/migrations/`. El seed SHALL residir en `packages/prisma-db/seed.ts`. El comando `prisma migrate dev` y `prisma db seed` SHALL ejecutarse en el contexto del API, utilizando el schema y las migraciones de `packages/prisma-db`.

#### Scenario: Migración aplica correctamente con schema en packages

- **WHEN** el desarrollador ejecuta `pnpm --filter api exec prisma migrate dev` (o `prisma migrate deploy`)
- **THEN** Prisma aplica las migraciones existentes y futuras usando `packages/prisma-db/schema.prisma` como fuente
- **AND** el directorio `packages/prisma-db/migrations/` contiene el historial de migraciones

### Requirement: Script db:generate regenera ambas apps

El script `db:generate` en el `package.json` raíz SHALL ejecutar `prisma generate` en API y Worker para regenerar los clientes Prisma tras cambios en el schema.

#### Scenario: db:generate actualiza clientes en API y Worker

- **WHEN** el desarrollador ejecuta `pnpm db:generate` en la raíz
- **THEN** se regenera el cliente Prisma en `apps/api`
- **AND** se regenera el cliente Prisma en `apps/worker`
- **AND** ambos clientes reflejan el contenido actual de `packages/prisma-db/schema.prisma`
