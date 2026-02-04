#!/bin/bash

# Script para iniciar todos los servicios de SIGQ

set -e  # Salir si hay algún error

echo "🚀 Iniciando servicios SIGQ..."
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "   Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo"
    echo "   Abre Docker Desktop y espera a que inicie completamente"
    exit 1
fi

# Determinar comando de compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
    echo "✅ Usando: docker compose (moderno)"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    echo "⚠️  Usando: docker-compose (antiguo)"
else
    echo "❌ Docker Compose no está disponible"
    exit 1
fi

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde env.example..."
    cp env.example .env
    echo "⚠️  IMPORTANTE: Edita .env y cambia las contraseñas por defecto"
    echo "   nano .env  # o tu editor preferido"
    echo ""
    read -p "¿Deseas continuar con las contraseñas por defecto? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Por favor edita .env y vuelve a ejecutar este script"
        exit 0
    fi
fi

# Cambiar al directorio del script
cd "$(dirname "$0")"

echo ""
echo "🐳 Iniciando contenedores..."
echo ""

# Iniciar servicios
$COMPOSE_CMD up -d

echo ""
echo "⏳ Esperando a que los servicios inicien..."
sleep 5

# Verificar estado
echo ""
echo "📊 Estado de los servicios:"
$COMPOSE_CMD ps

echo ""
echo "✅ Servicios iniciados!"
echo ""
echo "🌐 Acceso a los servicios:"
echo "   - PostgreSQL:     localhost:5432"
echo "   - Redis:           localhost:6379"
echo "   - MinIO Console:   http://localhost:9001"
echo "   - Keycloak:        http://localhost:8080"
echo "   - Orthanc:         http://localhost:8042"
echo "   - Prometheus:      http://localhost:9090"
echo "   - Grafana:         http://localhost:3001"
echo ""
echo "📝 Ver logs: $COMPOSE_CMD logs -f [servicio]"
echo "🛑 Detener:  $COMPOSE_CMD down"
echo ""
