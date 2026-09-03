#!/usr/bin/env bash

# Generado por SK-27 para: Prisma ORM + Docker (apps/backend/prisma/) — ver
# docs/00_stack_manifest.md. No es portable verbatim a otro ORM sin volver a correr SK-27
# (TK-038: .agents/scripts/ solo contiene tooling agnostico; este script vive en el arbol
# del proyecto consumidor porque asume Prisma + Docker + el layout real de apps/backend/prisma/).
#
# C-DEV-005-2 (AUDIT-DEV-005 D-6): el arbol prisma/migrations/ puede quedar desincronizado
# de schema.prisma cuando una columna se anade al schema y el despliegue real usa
# "prisma db push" (que reconcilia directo e ignora migrations/). El drift es invisible
# hasta que algo corre "prisma migrate deploy" -- p. ej. check_seed_idempotency.sh --, que
# revienta con P2022 ColumnNotFound y deja ese gate inservible para toda una clase de tickets.
#
# Este check es SIEMPRE-ON (no acotado al diff): levanta un Postgres efimero, aplica todas
# las migraciones y verifica que "prisma migrate diff" contra schema.prisma sea vacio.
set -uo pipefail

echo "Verificando paridad prisma/migrations/ <-> schema.prisma (C-DEV-005-2 / AUDIT-DEV-005 D-6)..."
echo ""

if ! command -v docker >/dev/null 2>&1; then
  echo "FALLO: Docker no disponible -- no se puede levantar Postgres efimero para replay de migraciones."
  echo "       Este check NO se puede aprobar por omision (rules/04_verified_implementation_standard.md, Antipatron B)."
  exit 1
fi

CONTAINER_NAME="restostock-migration-parity-check-$$"
HOST_PORT=55436
export DATABASE_URL="postgresql://postgres:postgres@localhost:${HOST_PORT}/restostock_parity_check"

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "-> Levantando Postgres efimero ($CONTAINER_NAME, puerto $HOST_PORT)..."
docker run -d --name "$CONTAINER_NAME" \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=restostock_parity_check \
  -p "${HOST_PORT}:5432" postgres:15-alpine >/dev/null

for _ in $(seq 1 30); do
  docker exec "$CONTAINER_NAME" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done

echo "-> Aplicando prisma/migrations/ con migrate deploy..."
if ! pnpm --filter @restostock/backend exec prisma migrate deploy --schema=prisma/schema.prisma >"/tmp/parity_deploy.$$" 2>&1; then
  cat "/tmp/parity_deploy.$$"; rm -f "/tmp/parity_deploy.$$"
  echo ""
  echo "FALLO: migrate deploy fallo -- las migraciones no aplican limpio sobre una base vacia."
  exit 1
fi
rm -f "/tmp/parity_deploy.$$"

echo "-> Comparando el esquema resultante contra schema.prisma..."
# pnpm --filter ... exec cambia el cwd a apps/backend/, por eso la ruta es relativa a ahi.
DIFF_OUT=$(pnpm --filter @restostock/backend exec prisma migrate diff \
  --from-config-datasource prisma.config.ts \
  --to-schema prisma/schema.prisma \
  --script 2>&1 | grep -vE '^(Loaded Prisma config|^$)')

echo ""
# Prisma imprime exactamente "-- This is an empty migration." cuando NO hay diff.
if [ "$(printf '%s' "$DIFF_OUT" | tr -d '[:space:]')" = "--Thisisanemptymigration." ]; then
  echo "OK: prisma/migrations/ produce exactamente el mismo esquema que schema.prisma -- sin drift."
  exit 0
fi

echo "FALLO: DRIFT -- migrate deploy NO produce el esquema de schema.prisma. Falta esta migracion:"
echo ""
echo "$DIFF_OUT"
echo ""
echo "       Genera la migracion de saneamiento (ver TK-094) -- 'prisma migrate dev --create-only' o a mano -- y vuelve a correr."
exit 1
