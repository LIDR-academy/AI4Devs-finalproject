#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="$ROOT/infra/docker/docker-compose.local.yml"

BACK_PID=""
FRONT_PID=""

cleanup() {
  echo ""
  echo "Stopping dev services..."
  [[ -n "$BACK_PID" ]] && kill "$BACK_PID" 2>/dev/null || true
  [[ -n "$FRONT_PID" ]] && kill "$FRONT_PID" 2>/dev/null || true
  docker compose -f "$COMPOSE_FILE" stop
  exit 0
}

trap cleanup SIGINT SIGTERM

# ── 1. Start DB ───────────────────────────────────────────────────────────────
CONFLICTING_CONTAINER="$(docker ps --filter "publish=5432" --format '{{.Names}}' | grep -v '^RealSaveFooding-postgres$' || true)"
if [[ -n "$CONFLICTING_CONTAINER" ]]; then
  echo "Port 5432 is in use by '$CONFLICTING_CONTAINER'; stopping it..."
  docker stop "$CONFLICTING_CONTAINER"
fi

echo "Starting database..."
docker compose -f "$COMPOSE_FILE" up -d

echo "Waiting for Postgres to be ready..."
until docker exec RealSaveFooding-postgres pg_isready -U postgres -q 2>/dev/null; do
  sleep 1
done
echo "Database ready."

# ── 2. Start backend ──────────────────────────────────────────────────────────
echo "Starting backend..."
(cd "$ROOT/back" && npm run start:dev) &
BACK_PID=$!

# ── 3. Start frontend ─────────────────────────────────────────────────────────
echo "Starting frontend..."
(cd "$ROOT/front" && npm run dev) &
FRONT_PID=$!

echo ""
echo "Dev environment running. Press Ctrl+C to stop."
wait
