#!/bin/bash

# Script para levantar el frontend (React + Nginx)
# Verifica que la infraestructura esté lista antes de arrancar

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verificar y arrancar Docker si es necesario
source "${SCRIPT_DIR}/lib/docker-check.sh"
check_and_start_docker || exit 1

echo ""
echo "🌐 Iniciando Frontend..."
echo ""

# Verificar que la infraestructura esté corriendo
echo "🔍 Verificando infraestructura..."
if ! docker exec covoituraje_db pg_isready -U app &>/dev/null; then
    echo "❌ PostgreSQL no está corriendo"
    echo "💡 Ejecuta primero: ./scripts/dev-infra.sh"
    exit 1
fi

if ! curl -f -s http://localhost:8080/realms/master &>/dev/null; then
    echo "❌ Keycloak no está corriendo"
    echo "💡 Ejecuta primero: ./scripts/dev-infra.sh"
    exit 1
fi

echo "✅ Infraestructura OK"
echo ""

# Verificar si hay microservicios corriendo
echo "🔍 Verificando microservicios..."
SERVICES_RUNNING=0

if curl -f -s http://localhost:8081/api/trips &>/dev/null || docker ps | grep -q covoituraje_trips_service; then
    ((SERVICES_RUNNING++))
fi

if curl -f -s http://localhost:8082/api/users &>/dev/null || docker ps | grep -q covoituraje_users_service; then
    ((SERVICES_RUNNING++))
fi

if [ $SERVICES_RUNNING -eq 0 ]; then
    echo "⚠️  No hay microservicios corriendo"
    echo ""
    echo "❓ ¿Quieres levantar los microservicios también? (recomendado)"
    echo "   El frontend necesita al menos trips-service y users-service"
    echo ""
    read -p "Levantar microservicios? [y/N]: " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Levantando microservicios..."
        docker-compose --profile services up -d trips-service users-service booking-service matching-service
        echo "⏳ Esperando a que los servicios arranquen (30 segundos)..."
        sleep 30
    else
        echo "⚠️  Continuando sin microservicios (el frontend puede no funcionar correctamente)"
    fi
else
    echo "✅ Microservicios detectados: $SERVICES_RUNNING"
fi

echo ""
echo "🏗️  Construyendo y levantando frontend..."
docker-compose --profile services up -d frontend

echo ""
echo "⏳ Esperando a que el frontend esté listo..."
sleep 5

# Verificar que el frontend esté corriendo
MAX_ATTEMPTS=12
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -f -s http://localhost:3000 &>/dev/null; then
        echo ""
        echo "✅ Frontend levantado exitosamente!"
        echo ""
        echo "🌐 Accede a la aplicación en:"
        echo "   👉 http://localhost:3000"
        echo ""
        echo "🔐 Credenciales de prueba:"
        echo "   Usuario: test.user"
        echo "   Contraseña: password123"
        echo ""
        echo "📋 Ver logs:"
        echo "   docker logs -f covoituraje_frontend"
        echo ""
        exit 0
    fi
    ((ATTEMPT++))
    echo -n "."
    sleep 5
done

echo ""
echo "⚠️  El frontend tardó más de lo esperado en arrancar"
echo ""
echo "🔍 Ver logs para diagnosticar:"
echo "   docker logs covoituraje_frontend"
echo ""
echo "💡 Puede que esté compilando. Espera un momento y verifica:"
echo "   curl http://localhost:3000"

