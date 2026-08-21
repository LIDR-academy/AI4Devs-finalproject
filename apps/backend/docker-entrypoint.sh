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

echo "Aplicando migraciones de base de datos pendientes (prisma migrate deploy)..."
apps/backend/node_modules/.bin/prisma migrate deploy --schema=apps/backend/prisma/schema.prisma

echo "Iniciando RestoStock Backend..."
exec node apps/backend/dist/infrastructure/http/server.js
