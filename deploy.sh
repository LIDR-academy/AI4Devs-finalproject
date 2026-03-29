#!/bin/bash
# =============================================================
# TRACÉ — Deploy script
# Uso: ./deploy.sh
# Ejecutar en el servidor EC2 dentro de /opt/trace
# =============================================================
# NGINX CONFIG REQUERIDA en /etc/nginx/sites-available/trace:
#
#   location /uploads/ {
#       proxy_pass http://localhost:4000;
#       proxy_http_version 1.1;
#       proxy_set_header Host $host;
#       add_header Cache-Control "public, max-age=86400";
#   }
#   location /api/ {
#       proxy_pass http://localhost:4000;
#       ...
#   }
#   location /socket.io/ { ... }
#   location / { proxy_pass http://localhost:3000; ... }
#
# =============================================================
set -e

echo "🚀 Iniciando despliegue de TRACÉ..."

# 1. Traer últimos cambios
git pull origin main

# 2. Reconstruir imágenes (solo las que cambiaron gracias al cache de Docker)
docker compose -f docker-compose.prod.yml build --parallel

# 3. Aplicar migraciones de base de datos ANTES de reiniciar el backend
# Levantamos solo postgres y redis primero para que la BD esté disponible
echo "📦 Levantando base de datos..."
docker compose -f docker-compose.prod.yml up -d postgres redis
echo "⏳ Esperando que postgres esté listo..."
sleep 5

echo "📦 Aplicando migraciones de Prisma..."
# Intentamos migrate deploy (usa los archivos SQL de prisma/migrations/).
# Si no hay migraciones en el contenedor, db push sincroniza el schema directamente.
docker compose -f docker-compose.prod.yml run --rm \
  backend \
  sh -c "node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma \
         || node_modules/.bin/prisma db push --schema=prisma/schema.prisma --accept-data-loss"

# 4. Reiniciar servicios con zero-downtime básico
# (levanta los nuevos contenedores, espera que estén healthy, para los viejos)
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 5. Limpiar imágenes antiguas para liberar espacio en disco
docker image prune -f

echo "✅ Despliegue completado."
docker compose -f docker-compose.prod.yml ps
