#!/usr/bin/env bash

# Generado por SK-27 para: Prisma ORM + Docker (apps/backend/prisma/seed.ts) — ver
# docs/00_stack_manifest.md. No es portable verbatim a otro ORM/gestor de contenedores sin
# volver a correr SK-27 (TK-038: .agents/scripts/ solo contiene tooling agnóstico; este
# script vive en el árbol del proyecto consumidor porque asume Prisma + Docker + el layout
# real de apps/backend/prisma/).
#
# TK-055: automatiza el Antipatrón B de rules/04_verified_implementation_standard.md
# ("artefacto de seed/migración documentado pero nunca ejecutado de verdad") — nacido de
# TK-051, donde prisma/seed.ts existía, tenía el nombre de variable correcto, pero nunca se
# había ejecutado y guardaba el PIN del admin en texto plano.
#
# Alcance: bloqueante SOLO si el diff sin commitear del ticket en curso toca
# prisma/seed.ts, prisma/schema.prisma o prisma/migrations/ — mismo criterio de
# check_ticket_code_quality.sh. Levanta Postgres efímero real, corre migrate+seed DOS
# veces, y falla si la segunda corrida no es idempotente (duplica filas o revienta).
set -uo pipefail

BACKEND_DIR="apps/backend"
SEED_GLOB=("$BACKEND_DIR/prisma/seed.ts" "$BACKEND_DIR/prisma/schema.prisma" "$BACKEND_DIR/prisma/migrations")

TOUCHED=$( { git diff --name-only --diff-filter=ACMR -- "${SEED_GLOB[@]}"
             git diff --name-only --staged --diff-filter=ACMR -- "${SEED_GLOB[@]}"
             git ls-files --others --exclude-standard -- "${SEED_GLOB[@]}"; } | sort -u)

if [ -z "$TOUCHED" ]; then
  echo "✨ El ticket en curso no toca seed.ts/schema.prisma/migrations. Nada que verificar (deuda preexistente no tocada no bloquea)."
  exit 0
fi

echo "📝 El ticket en curso toca: $(echo "$TOUCHED" | tr '\n' ' ')"
echo "🔍 Verificando ejecución real e idempotente de prisma/seed.ts contra Postgres efímero..."
echo ""

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker no disponible en este entorno — no se puede levantar Postgres efímero real."
  echo "   Este check NO se puede aprobar por omisión (rules/04_verified_implementation_standard.md, Antipatrón B)."
  exit 1
fi

CONTAINER_NAME="restostock-seed-idempotency-check-$$"
HOST_PORT=55432
DB_URL="postgresql://postgres:postgres@localhost:${HOST_PORT}/restostock_seed_check"

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "▶ Levantando Postgres efímero ($CONTAINER_NAME, puerto $HOST_PORT)..."
docker run -d --name "$CONTAINER_NAME" \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=restostock_seed_check \
  -p "${HOST_PORT}:5432" postgres:15-alpine >/dev/null

echo "▶ Esperando a que Postgres acepte conexiones..."
for _ in $(seq 1 30); do
  docker exec "$CONTAINER_NAME" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done

run_migrate_and_seed() {
  # pnpm --filter ... exec ya cambia el cwd a apps/backend/, asi que las rutas son relativas a ahi.
  DATABASE_URL="$DB_URL" NODE_ENV=development SEED_ADMIN_PIN=1234 \
    pnpm --filter @restostock/backend exec prisma migrate deploy --schema=prisma/schema.prisma \
    && DATABASE_URL="$DB_URL" NODE_ENV=production SEED_ADMIN_PIN=1234 \
    pnpm --filter @restostock/backend exec tsx prisma/seed.ts
}

echo "▶ Corrida 1 de migrate + seed..."
if ! run_migrate_and_seed; then
  echo "❌ La primera corrida de migrate+seed falló — el seed no es ni siquiera ejecutable."
  exit 1
fi

USERS_AFTER_1=$(docker exec "$CONTAINER_NAME" psql -U postgres -d restostock_seed_check -tAc 'SELECT COUNT(*) FROM "User";')
echo "   Usuarios tras corrida 1: $USERS_AFTER_1"

echo "▶ Corrida 2 de migrate + seed (debe ser idempotente)..."
if ! run_migrate_and_seed; then
  echo "❌ La segunda corrida de seed falló — no es idempotente (revienta en reinicio de contenedor real)."
  exit 1
fi

USERS_AFTER_2=$(docker exec "$CONTAINER_NAME" psql -U postgres -d restostock_seed_check -tAc 'SELECT COUNT(*) FROM "User";')
echo "   Usuarios tras corrida 2: $USERS_AFTER_2"

echo ""
if [ "$USERS_AFTER_1" != "$USERS_AFTER_2" ]; then
  echo "❌ El seed duplicó filas entre corridas ($USERS_AFTER_1 → $USERS_AFTER_2). No es idempotente — usa upsert, no create."
  exit 1
fi

echo "✨ prisma/seed.ts se ejecutó de verdad contra Postgres real, dos veces, sin duplicar filas (idempotente)."
