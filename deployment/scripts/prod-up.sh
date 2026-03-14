#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ ! -f "$ROOT_DIR/deployment/.env" ]]; then
  echo "deployment/.env not found. Copy deployment/.env.example to deployment/.env first."
  exit 1
fi

cd "$ROOT_DIR"
docker compose -f deployment/docker-compose.prod.yml up --build -d
