#!/usr/bin/env bash
set -euo pipefail
exec > >(tee -a /var/log/user-data.log) 2>&1

# Primer arranque de la instancia (via `user_data` de infra/ec2.tf,
# templatefile() sobre este fichero). Solo hace `docker compose pull` - las
# imagenes de backend/frontend se construyen en el runner de GitHub Actions,
# nunca aqui, por lo que no hace falta swap para un build de Next.js en un
# host de 1 GB de RAM (t3.micro).
#
# Las variables entre llaves dobladas de este fichero las sustituye Terraform
# (templatefile) en tiempo de apply; no son variables de entorno del shell.

echo "[user_data] $(date -u +%FT%TZ) - inicio"

dnf update -y
dnf install -y docker unzip

systemctl enable --now docker
usermod -aG docker ec2-user

DOCKER_COMPOSE_VERSION="v2.29.7"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# El log de redeploy.sh (ejecutado despues, por SSH como ec2-user) necesita
# que el fichero ya exista con permisos de escritura para ese usuario.
touch /var/log/redeploy.log
chown ec2-user:ec2-user /var/log/redeploy.log

APP_DIR=/opt/runmarket
mkdir -p "$APP_DIR"
cd "$APP_DIR"

aws s3 cp "s3://${artifacts_bucket}/app.zip" app.zip --region "${aws_region}"
unzip -o app.zip
rm -f app.zip

# Variables de entorno para docker-compose.prod.yml - nunca en el
# repositorio, solo en este fichero generado en la instancia.
cat > "$APP_DIR/.env" <<ENVEOF
DB_USER=${db_user}
DB_PASSWORD=${db_password}
DB_NAME=${db_name}
GHCR_OWNER=${ghcr_owner}
IMAGE_TAG=${image_tag}
CORS_ORIGIN=${cors_origin}
ASSETS_BASE_URL=${cors_origin}
ENVEOF
chmod 600 "$APP_DIR/.env"
chown ec2-user:ec2-user "$APP_DIR/.env"

echo "[user_data] docker compose pull"
docker compose -f docker-compose.prod.yml pull

echo "[user_data] docker compose up -d"
docker compose -f docker-compose.prod.yml up -d

echo "[user_data] esperando a que el backend responda antes de migrar"
for i in $(seq 1 30); do
  if docker compose -f docker-compose.prod.yml exec -T backend \
    node -e "require('http').get('http://localhost:4000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))" 2>/dev/null; then
    break
  fi
  sleep 2
done

echo "[user_data] prisma migrate deploy"
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

echo "[user_data] db:seed (solo en el primer arranque)"
docker compose -f docker-compose.prod.yml exec -T backend npm run db:seed

echo "[user_data] $(date -u +%FT%TZ) - completado"

# Marcador para que el pipeline de deploy (SSH + redeploy.sh) sepa que el
# primer arranque ha terminado y no entre antes de que exista redeploy.sh -
# sshd esta disponible mucho antes de que este script termine (dnf update +
# instalar Docker + pull de imagenes en un t3.micro tarda varios minutos).
touch "$APP_DIR/.user-data-complete"
chown ec2-user:ec2-user "$APP_DIR/.user-data-complete"
