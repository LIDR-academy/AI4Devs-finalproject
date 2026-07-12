#!/usr/bin/env bash
set -euo pipefail

# Empaqueta los artefactos de despliegue (docker-compose.prod.yml + nginx.conf
# + redeploy.sh) en infra/app.zip. Utilidad para el flujo manual documentado
# en docs/DEPLOYMENT-STRATEGY.md ("Alternativa - Terraform manual"). Terraform
# usa su propio mecanismo (infra/artifacts.tf, data "archive_file") y no
# invoca este script.
#
# No empaqueta codigo fuente: las imagenes de backend/frontend se construyen
# fuera de la EC2 (runner de GitHub Actions) y se consumen por `image:` desde
# GHCR (docker-compose.prod.yml).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$INFRA_DIR")"
ZIP_PATH="$INFRA_DIR/app.zip"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

cp "$ROOT_DIR/docker-compose.prod.yml" "$WORKDIR/docker-compose.prod.yml"
mkdir -p "$WORKDIR/nginx"
cp "$ROOT_DIR/nginx/nginx.conf" "$WORKDIR/nginx/nginx.conf"
cp "$SCRIPT_DIR/redeploy.sh" "$WORKDIR/redeploy.sh"

rm -f "$ZIP_PATH"
(cd "$WORKDIR" && zip -r "$ZIP_PATH" . >/dev/null)

echo "Generado: $ZIP_PATH"
