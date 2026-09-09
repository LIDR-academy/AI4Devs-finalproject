#!/bin/sh
set -e

# Resueltos en runtime: node:24-alpine (Alpine 3.24) solo trae libssl.so.3, y la deteccion
# automatica de Prisma 5.x — tanto para el query-engine (usado por @prisma/client) como
# para el schema-engine (usado por `migrate deploy`, binario SEPARADO) — sigue eligiendo
# la variante enlazada contra OpenSSL 1.1 pese a tener instalado el CLI `openssl` (TK-042
# para el query-engine, TK-043 al automatizar migrate deploy y descubrir que el schema-engine
# tiene el mismo problema con una variable de entorno distinta).
export PRISMA_QUERY_ENGINE_LIBRARY="$(find node_modules/.pnpm -name 'libquery_engine-linux-musl-openssl-3.0.x.so.node' | head -1)"
export PRISMA_SCHEMA_ENGINE_BINARY="$(find node_modules/.pnpm -name 'schema-engine-linux-musl-openssl-3.0.x' | head -1)"

# Guard 25 / TK-097: SIEMPRE `migrate deploy` — nunca `db push`. Los archivos de
# `prisma/migrations/` llevan el backfill seguro de cada cambio de esquema (ej. la
# migración 20260903230000 re-apunta las filas MAIN_WAREHOUSE al sector semilla antes
# de imponer la FK NOT NULL); `db push --accept-data-loss` los saltaría y borraría datos.
# TK-071 lo había parcheado a `db push` por drift migrations<->schema; TK-094 cerró esa
# causa raíz (check_migration_schema_parity.sh verde), así que esto vuelve a ser seguro.
#
# Si `migrate deploy` falla en una BD que se venía gestionando con `db push` (su
# _prisma_migrations no registra migraciones cuyos cambios YA están aplicados), hacer
# UNA sola vez, por cada una: prisma migrate resolve --applied <migración>.
echo "Aplicando migraciones de base de datos pendientes (prisma migrate deploy)..."
apps/backend/node_modules/.bin/prisma migrate deploy --schema=apps/backend/prisma/schema.prisma --config=apps/backend/prisma.config.ts



# Bootstrap idempotente del primer administrador (TK-051): sin esto, una base de datos
# nueva no tiene forma de crear usuarios via la API — POST /api/v1/auth/users exige ya
# ser ADMIN. Se omite en silencio si SEED_ADMIN_PIN no esta seteado (ver seed.ts).
echo "Verificando/sembrando administrador inicial (idempotente)..."
node apps/backend/dist/prisma/seed.js

echo "Iniciando RestoStock Backend..."
exec node apps/backend/dist/infrastructure/http/server.js
