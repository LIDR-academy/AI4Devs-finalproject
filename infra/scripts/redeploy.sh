#!/usr/bin/env bash
set -euo pipefail
exec > >(tee -a /var/log/redeploy.log) 2>&1

# Se ejecuta por SSH en la EC2 en cada deploy posterior al primer arranque
# (a mano o desde el job `deploy` del pipeline, US-018-TASK-11). Asume que
# docker-compose.prod.yml ya vive en APP_DIR (desplegado por
# user_data.sh.tpl en el primer arranque) y que el .env de la instancia ya
# contiene las variables necesarias para docker compose.
#
# A diferencia del primer arranque, aqui NO se ejecuta `npm run db:seed`
# (ver docs/INFRASTRUCTURE.md 3.3): repetirlo duplicaria el catalogo.

echo "[redeploy] $(date -u +%FT%TZ) - inicio"

APP_DIR="${APP_DIR:-/opt/runmarket}"
cd "$APP_DIR"

echo "[redeploy] docker compose pull"
docker compose -f docker-compose.prod.yml pull

echo "[redeploy] docker compose up -d"
docker compose -f docker-compose.prod.yml up -d

echo "[redeploy] prisma migrate deploy"
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

echo "[redeploy] $(date -u +%FT%TZ) - completado"
