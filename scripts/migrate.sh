#!/bin/bash

# Script para ejecutar migraciones de Flyway en todos los servicios

echo "🔄 Ejecutando migraciones de Flyway..."

# Verificar que PostgreSQL esté ejecutándose
if ! docker exec covoituraje_db pg_isready -U app > /dev/null 2>&1; then
    echo "❌ PostgreSQL no está ejecutándose. Ejecuta primero: ./scripts/dev-infra.sh"
    exit 1
fi

# Ejecutar migraciones para cada servicio
services=("trips-service" "users-service" "booking-service" "matching-service" "notification-service")

for service in "${services[@]}"; do
    echo "📦 Ejecutando migraciones para $service..."
    cd "Backend/$service"
    
    # Ejecutar migraciones de Flyway
    mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5433/app -Dflyway.user=app -Dflyway.password=app
    
    if [ $? -eq 0 ]; then
        echo "✅ Migraciones de $service completadas"
    else
        echo "❌ Error en migraciones de $service"
        exit 1
    fi
    
    cd ../..
done

echo "🎉 Todas las migraciones completadas exitosamente!"
echo ""
echo "Los esquemas están listos:"
echo "📊 trips (trips-service)"
echo "👥 users (users-service)"
echo "📋 bookings (booking-service)"
echo "🔗 matches (matching-service)"
echo "🔔 notifications (notification-service)"
