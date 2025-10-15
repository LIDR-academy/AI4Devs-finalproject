#!/bin/bash

# Script para verificar el estado completo del sistema
# Infraestructura + Microservicios + Frontend

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verificar Docker (sin intentar arrancarlo, solo informar)
if ! docker ps &>/dev/null; then
    echo "❌ Docker no está corriendo"
    echo "💡 Inicia Docker Desktop e intenta de nuevo"
    echo "   O ejecuta: ${SCRIPT_DIR}/lib/docker-check.sh"
    exit 1
fi

echo "🔍 Verificando estado completo del sistema..."
echo ""

# ============================================
# INFRAESTRUCTURA
# ============================================
echo "📦 INFRAESTRUCTURA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

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

# ============================================
# MICROSERVICIOS
# ============================================
echo "🔧 MICROSERVICIOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar trips-service
echo -n "🚗 Trips Service: "
if curl -f -s http://localhost:8081/api/health &>/dev/null || curl -f -s http://localhost:8081/api/trips &>/dev/null; then
    echo "✅ OK (puerto 8081)"
elif docker ps | grep -q covoituraje_trips_service; then
    echo "⚠️  Arrancando... (puerto 8081)"
else
    echo "⏸️  No iniciado"
fi

# Verificar users-service
echo -n "👤 Users Service: "
if curl -f -s http://localhost:8082/api/health &>/dev/null || curl -f -s http://localhost:8082/api/users &>/dev/null; then
    echo "✅ OK (puerto 8082)"
elif docker ps | grep -q covoituraje_users_service; then
    echo "⚠️  Arrancando... (puerto 8082)"
else
    echo "⏸️  No iniciado"
fi

# Verificar booking-service
echo -n "📅 Booking Service: "
if curl -f -s http://localhost:8083/api/health &>/dev/null || curl -f -s http://localhost:8083/api/bookings &>/dev/null; then
    echo "✅ OK (puerto 8083)"
elif docker ps | grep -q covoituraje_booking_service; then
    echo "⚠️  Arrancando... (puerto 8083)"
else
    echo "⏸️  No iniciado"
fi

# Verificar matching-service
echo -n "🎯 Matching Service: "
if curl -f -s http://localhost:8084/api/health &>/dev/null || curl -f -s http://localhost:8084/api/matches &>/dev/null; then
    echo "✅ OK (puerto 8084)"
elif docker ps | grep -q covoituraje_matching_service; then
    echo "⚠️  Arrancando... (puerto 8084)"
else
    echo "⏸️  No iniciado"
fi

# Verificar notification-service
echo -n "🔔 Notification Service: "
if curl -f -s http://localhost:8085/api/notifications/health &>/dev/null || curl -f -s http://localhost:8085/api/notifications &>/dev/null; then
    echo "✅ OK (puerto 8085)"
elif docker ps | grep -q covoituraje_notification_service; then
    echo "⚠️  Arrancando... (puerto 8085)"
else
    echo "⏸️  No iniciado"
fi

echo ""

# ============================================
# FRONTEND
# ============================================
echo "🌐 FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "⚛️  React App: "
if curl -f -s http://localhost:3000 &>/dev/null; then
    echo "✅ OK (http://localhost:3000)"
elif docker ps | grep -q covoituraje_frontend; then
    echo "⚠️  Arrancando... (puerto 3000)"
else
    echo "⏸️  No iniciado"
fi

echo ""

# ============================================
# RESUMEN
# ============================================
echo "📋 CONTENEDORES ACTIVOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep covoituraje || echo "No hay contenedores activos"

echo ""
echo "💡 COMANDOS ÚTILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   • Levantar microservicios: docker-compose --profile services up -d"
echo "   • Levantar solo frontend: docker-compose --profile services up frontend -d"
echo "   • Ver logs de todos: docker-compose logs -f"
echo "   • Detener servicios: docker-compose --profile services down"
echo "   • Verificar solo infra: ./scripts/verify-infra.sh"
