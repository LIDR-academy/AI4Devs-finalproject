## 1. Crear paquete packages/prisma-db

- [x] 1.1 Crear directorio `packages/prisma-db/`
- [x] 1.2 Crear `packages/prisma-db/package.json` con `name: "@adresles/prisma-db"`, `version: "0.1.0"`, `private: true`, `files: ["schema.prisma", "generated", "seed.ts", "migrations"]`
- [x] 1.3 Copiar `apps/api/prisma/schema.prisma` a `packages/prisma-db/schema.prisma`

## 2. Actualizar apps/api

- [x] 2.1 Añadir `"@adresles/prisma-db": "workspace:*"` en dependencies de `apps/api/package.json`
- [x] 2.2 Añadir `"prisma": { "schema": "../../packages/prisma-db/schema.prisma" }` en `apps/api/package.json`
- [x] 2.3 Eliminar `apps/api/prisma/schema.prisma` (ya movido)
- [x] 2.4 Ejecutar `pnpm install` en la raíz y verificar que la dependencia se resuelve

## 3. Actualizar apps/worker

- [x] 3.1 Añadir `"@adresles/prisma-db": "workspace:*"` en dependencies de `apps/worker/package.json`
- [x] 3.2 Cambiar `"prisma": { "schema": "../api/prisma/schema.prisma" }` por `"prisma": { "schema": "../../packages/prisma-db/schema.prisma" }` en `apps/worker/package.json`

## 4. Scripts raíz y verificación

- [x] 4.1 Actualizar script `db:generate` en root `package.json` a `pnpm --filter @adresles/prisma-db run generate`
- [x] 4.2 Añadir script `db:migrate:deploy` si no existe: `pnpm --filter api exec prisma migrate deploy`
- [x] 4.3 Ejecutar `pnpm db:generate` y verificar que API y Worker generan cliente correctamente
- [x] 4.4 Ejecutar `pnpm --filter api exec prisma migrate dev` (o `prisma migrate status`) y verificar que las migraciones siguen accesibles

## 5. Verificación cross-platform y tipos

- [x] 5.1 Ejecutar `npx tsc --noEmit` en `apps/api/` sin errores
- [x] 5.2 Ejecutar `npx tsc --noEmit` en `apps/worker/` sin errores
- [x] 5.3 Ejecutar `pnpm test` en API y Worker para detectar regresiones
- [x] 5.4 Verificar en Windows (o documentar) que las rutas relativas del schema resuelven correctamente

## 6. Documentación ADR

- [x] 6.1 Actualizar ADR-007 para mencionar `packages/prisma-db` como extensión del patrón de paquetes compartidos
- [x] 6.2 Crear ADR-009 (o actualizar ADR-008) documentando la Opción B como decisión final para el schema Prisma compartido
