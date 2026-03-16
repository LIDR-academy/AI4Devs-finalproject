#!/bin/bash

# Script para iniciar servicios de monitoreo
# Uso: ./start-monitoring.sh

set -e

echo "🚀 Iniciando servicios de monitoreo..."

cd "$(dirname "$0")"

# Verificar que docker-compose está disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado o no está en el PATH"
    exit 1
fi

# Iniciar servicios de monitoreo
echo "📊 Iniciando Prometheus..."
docker compose up -d prometheus

echo "📈 Iniciando Loki..."
docker compose up -d loki

echo "📝 Iniciando Promtail..."
docker compose up -d promtail

echo "📉 Iniciando Grafana..."
docker compose up -d grafana

echo ""
echo "✅ Servicios de monitoreo iniciados:"
echo "   - Prometheus: http://localhost:9090"
echo "   - Loki: http://localhost:3100"
echo "   - Grafana: http://localhost:3001"
echo ""
echo "Para ver los logs:"
echo "   docker compose logs -f loki promtail prometheus grafana"
echo ""
echo "Para detener los servicios:"
echo "   docker compose stop prometheus loki promtail grafana"
