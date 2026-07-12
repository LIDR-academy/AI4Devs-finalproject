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

log() {
  echo "[redeploy] $(date -u +%FT%TZ) - $*"
}

log "inicio"

APP_DIR="${APP_DIR:-/opt/runmarket}"
cd "$APP_DIR"

# --progress=plain fuerza lineas de log normales en vez de la barra de
# progreso interactiva de docker compose, que no se ve bien (o parece
# colgada) al reenviarse por SSH hasta el log del step de GitHub Actions.
log "docker compose pull"
docker compose -f docker-compose.prod.yml --progress=plain pull

log "docker compose up -d"
docker compose -f docker-compose.prod.yml up -d

log "estado de los contenedores"
docker compose -f docker-compose.prod.yml ps

log "prisma migrate deploy"
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

log "completado"
