#!/usr/bin/env bash
# prod-pull.sh
# Build production images locally, tag them, and push to the private registry.
# After running this script the VPS can pull the updated images with prod-up.sh.
#
# Usage: ./deployment/scripts/prod-pull.sh [--no-cache]
#
# Requires: deployment/.env  (must contain PRIVATE_DOCKER_REPOSITORY)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/deployment/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: deployment/.env not found. Copy deployment/.env.example to deployment/.env first."
  exit 1
fi

# ── Load PRIVATE_DOCKER_REPOSITORY from .env ──────────────────────────────────
PRIVATE_DOCKER_REPOSITORY="${PRIVATE_DOCKER_REPOSITORY:-}"
if [[ -z "$PRIVATE_DOCKER_REPOSITORY" ]]; then
  PRIVATE_DOCKER_REPOSITORY="$(grep -E '^[[:space:]]*PRIVATE_DOCKER_REPOSITORY=' "$ENV_FILE" | tail -n1 | sed -E 's/^[[:space:]]*PRIVATE_DOCKER_REPOSITORY=//; s/^"//; s/"$//; s/[[:space:]]+$//')"
fi

if [[ -z "$PRIVATE_DOCKER_REPOSITORY" ]]; then
  echo "ERROR: PRIVATE_DOCKER_REPOSITORY is not set in deployment/.env"
  exit 1
fi

BUILD_ARGS=""
if [[ "${1:-}" == "--no-cache" ]]; then
  BUILD_ARGS="--no-cache"
fi

# ── Resolve image tags ─────────────────────────────────────────────────────────
BACKEND_IMAGE="${PRIVATE_DOCKER_REPOSITORY}:ipfs-gateway-prod-backend-latest"
CELERY_IMAGE="${PRIVATE_DOCKER_REPOSITORY}:ipfs-gateway-prod-celery-latest"
FRONTEND_IMAGE="${PRIVATE_DOCKER_REPOSITORY}:ipfs-gateway-prod-frontend-latest"
NGINX_IMAGE="${PRIVATE_DOCKER_REPOSITORY}:ipfs-gateway-prod-nginx-latest"

echo "============================================================"
echo "  Registry : $PRIVATE_DOCKER_REPOSITORY"
echo "  Backend  : $BACKEND_IMAGE"
echo "  Celery   : $CELERY_IMAGE"
echo "  Frontend : $FRONTEND_IMAGE"
echo "  Nginx    : $NGINX_IMAGE"
echo "============================================================"
echo ""

cd "$ROOT_DIR"

# ── Build ─────────────────────────────────────────────────────────────────────
echo ">>> Building backend..."
docker build $BUILD_ARGS \
  -f deployment/docker/backend/Dockerfile \
  -t "$BACKEND_IMAGE" \
  backend/

echo ""
echo ">>> Building celery..."
docker build $BUILD_ARGS \
  -f deployment/docker/celery/Dockerfile \
  -t "$CELERY_IMAGE" \
  backend/

echo ""
echo ">>> Building frontend..."
docker build $BUILD_ARGS \
  --build-arg NEXT_PUBLIC_API_URL="" \
  --build-arg BACKEND_API_URL=http://backend:5000 \
  -f deployment/docker/frontend/Dockerfile \
  -t "$FRONTEND_IMAGE" \
  frontend/

echo ""
echo ">>> Building nginx..."
docker build $BUILD_ARGS \
  -f deployment/docker/nginx/Dockerfile \
  -t "$NGINX_IMAGE" \
  deployment/docker/nginx/

# ── Push ──────────────────────────────────────────────────────────────────────
echo ""
echo ">>> Pushing images to registry..."
docker push "$BACKEND_IMAGE"
docker push "$CELERY_IMAGE"
docker push "$FRONTEND_IMAGE"
docker push "$NGINX_IMAGE"

echo ""
echo "============================================================"
echo "  All images pushed successfully."
echo "  On the VPS, run: ./deployment/scripts/prod-up.sh"
echo "============================================================"
