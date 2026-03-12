#!/bin/bash

# Script para levantar solo la infraestructura de desarrollo
# Incluye: PostgreSQL, Redis, Keycloak, Mailhog

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verificar y arrancar Docker si es necesario
source "${SCRIPT_DIR}/lib/docker-check.sh"
check_and_start_docker || exit 1

echo ""
echo "🚀 Levantando infraestructura de desarrollo..."

# Levantar solo los servicios de infraestructura
docker-compose up -d db redis keycloak mailhog

echo "⏳ Esperando a que los servicios estén listos..."

# Esperar a que PostgreSQL esté listo
echo "📊 Esperando PostgreSQL..."
until docker exec covoituraje_db pg_isready -U app; do
  echo "PostgreSQL no está listo aún..."
  sleep 2
done
echo "✅ PostgreSQL está listo"

# Esperar a que Keycloak esté listo
echo "🔐 Esperando Keycloak..."
until curl -f -s http://localhost:8080/realms/master 2>/dev/null | grep -q "realm"; do
  echo "Keycloak no está listo aún..."
  sleep 5
done
echo "✅ Keycloak está listo"

echo "🎉 Infraestructura lista!"
echo ""
echo "Servicios disponibles:"
echo "📊 PostgreSQL: localhost:5433"
echo "🔐 Keycloak: http://localhost:8080 (admin/admin)"
echo "📧 Mailhog: http://localhost:8025"
echo "🗄️ Redis: localhost:6379"
echo ""
echo "Para levantar los microservicios, ejecuta:"
echo "docker-compose --profile services up -d"
