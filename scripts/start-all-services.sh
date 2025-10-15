#!/bin/bash

# Script para levantar todos los servicios (microservicios + frontend)
# Verifica que la infraestructura esté lista antes de arrancar

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verificar y arrancar Docker si es necesario
source "${SCRIPT_DIR}/lib/docker-check.sh"
check_and_start_docker || exit 1

echo ""
echo "🚀 Iniciando Todos los Servicios..."
echo ""

# Verificar que la infraestructura esté corriendo
echo "🔍 Paso 1: Verificando infraestructura..."
if ! docker exec covoituraje_db pg_isready -U app &>/dev/null; then
    echo "❌ PostgreSQL no está corriendo"
    echo ""
    echo "💡 Levantando infraestructura..."
    ./scripts/dev-infra.sh
    echo ""
fi

# Verificar de nuevo
if ! docker exec covoituraje_db pg_isready -U app &>/dev/null; then
    echo "❌ Error: No se pudo levantar la infraestructura"
    exit 1
fi

echo "✅ Infraestructura OK"
echo ""

# Levantar todos los microservicios
echo "🔧 Paso 2: Levantando microservicios..."
echo "   • trips-service (puerto 8081)"
echo "   • users-service (puerto 8082)"
echo "   • booking-service (puerto 8083)"
echo "   • matching-service (puerto 8084)"
echo "   • notification-service (puerto 8085)"
echo ""

docker-compose --profile services up -d \
    trips-service \
    users-service \
    booking-service \
    matching-service \
    notification-service

echo ""
echo "⏳ Esperando a que los microservicios arranquen (30 segundos)..."
sleep 30

# Levantar frontend
echo ""
echo "🌐 Paso 3: Levantando frontend..."
docker-compose --profile services up -d frontend

echo ""
echo "⏳ Esperando a que el frontend esté listo (20 segundos)..."
sleep 20

# Verificación final
echo ""
echo "🔍 Paso 4: Verificando estado de todos los servicios..."
echo ""
./scripts/verify-all.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ¡Sistema completo levantado!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 FRONTEND:"
echo "   👉 http://localhost:3000"
echo ""
echo "🔧 MICROSERVICIOS:"
echo "   • Trips:         http://localhost:8081/api/trips"
echo "   • Users:         http://localhost:8082/api/users"
echo "   • Bookings:      http://localhost:8083/api/bookings"
echo "   • Matches:       http://localhost:8084/api/matches"
echo "   • Notifications: http://localhost:8085/api/notifications"
echo ""
echo "🔐 KEYCLOAK:"
echo "   • Admin: http://localhost:8080 (admin/admin)"
echo "   • Realm: http://localhost:8080/realms/covoituraje"
echo ""
echo "👤 USUARIO DE PRUEBA:"
echo "   • Usuario: test.user"
echo "   • Contraseña: password123"
echo ""
echo "📋 COMANDOS ÚTILES:"
echo "   • Ver logs de todo:     docker-compose logs -f"
echo "   • Ver logs de frontend: docker logs -f covoituraje_frontend"
echo "   • Detener todo:         docker-compose --profile services down"
echo "   • Verificar estado:     ./scripts/verify-all.sh"
echo ""

