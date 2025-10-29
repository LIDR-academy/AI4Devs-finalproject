#!/bin/bash

# Script para verificar el estado de la infraestructura

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verificar Docker (sin intentar arrancarlo, solo informar)
if ! docker ps &>/dev/null; then
    echo "❌ Docker no está corriendo"
    echo "💡 Inicia Docker Desktop e intenta de nuevo"
    echo "   O ejecuta: ${SCRIPT_DIR}/lib/docker-check.sh"
    exit 1
fi

echo "🔍 Verificando estado de la infraestructura..."
echo ""

# Verificar PostgreSQL
echo -n "📊 PostgreSQL: "
if docker exec covoituraje_db pg_isready -U app &>/dev/null; then
    echo "✅ OK (puerto 5434)"
else
    echo "❌ NO DISPONIBLE"
fi

# Verificar Keycloak
echo -n "🔐 Keycloak: "
if curl -f -s http://localhost:8080/realms/master &>/dev/null; then
    echo "✅ OK (http://localhost:8080)"
else
    echo "❌ NO DISPONIBLE"
fi

# Verificar Redis
echo -n "🗄️  Redis: "
if docker exec covoituraje_redis redis-cli ping &>/dev/null; then
    echo "✅ OK (puerto 6379)"
else
    echo "❌ NO DISPONIBLE"
fi

# Verificar Mailhog
echo -n "📧 Mailhog: "
if curl -f -s http://localhost:8025 &>/dev/null; then
    echo "✅ OK (http://localhost:8025)"
else
    echo "❌ NO DISPONIBLE"
fi

echo ""
echo "📋 Contenedores activos:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep covoituraje

echo ""
echo "💡 Comandos útiles:"
echo "   • Ver logs de Keycloak: docker logs covoituraje_keycloak"
echo "   • Ver logs de PostgreSQL: docker logs covoituraje_db"
echo "   • Conectar a PostgreSQL: psql -h localhost -p 5434 -U app -d app"
echo "   • Acceder a Keycloak Admin: http://localhost:8080 (admin/admin)"

