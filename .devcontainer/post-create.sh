#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
BACKEND_DIR="$ROOT_DIR/app/backend"
FRONTEND_DIR="$ROOT_DIR/app/frontend"

echo "[devcontainer] Starting post-create setup..."

if [ -f "$BACKEND_DIR/package.json" ]; then
  echo "[devcontainer] Installing backend dependencies..."
  cd "$BACKEND_DIR"
  npm install

  if [ -f "$BACKEND_DIR/prisma/schema.prisma" ]; then
    echo "[devcontainer] Generating Prisma client..."
    npm run prisma:generate || true
  fi
fi

if [ -f "$FRONTEND_DIR/package.json" ]; then
  echo "[devcontainer] Installing frontend dependencies..."
  cd "$FRONTEND_DIR"
  npm install
fi

cd "$ROOT_DIR"
echo "[devcontainer] Setup finished."
