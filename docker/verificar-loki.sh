#!/bin/bash

# Script para verificar el estado de Loki
# Uso: ./verificar-loki.sh

set -e

echo "🔍 Verificando estado de Loki..."
echo ""

cd "$(dirname "$0")"

# Verificar si el contenedor existe
if ! docker compose ps loki &> /dev/null; then
    echo "❌ El servicio Loki no está definido en docker-compose.yml"
    exit 1
fi

# Verificar estado del contenedor
echo "📊 Estado del contenedor:"
docker compose ps loki
echo ""

# Verificar si está corriendo
if docker compose ps loki | grep -q "Up"; then
    echo "✅ Contenedor está corriendo"
    
    # Verificar logs recientes
    echo ""
    echo "📝 Últimas 20 líneas de logs:"
    docker compose logs --tail=20 loki
    echo ""
    
    # Verificar puerto
    echo "🔌 Verificando puerto 3100..."
    if lsof -i :3100 &> /dev/null || netstat -an | grep 3100 &> /dev/null; then
        echo "✅ Puerto 3100 está en uso"
    else
        echo "⚠️  Puerto 3100 no está en uso"
    fi
    
    # Probar endpoint
    echo ""
    echo "🌐 Probando endpoint /ready..."
    if curl -s http://localhost:3100/ready &> /dev/null; then
        echo "✅ Loki responde en http://localhost:3100/ready"
        curl -s http://localhost:3100/ready
        echo ""
    else
        echo "❌ Loki NO responde en http://localhost:3100/ready"
        echo "   Verifica los logs con: docker compose logs loki"
    fi
else
    echo "❌ Contenedor NO está corriendo"
    echo ""
    echo "Para iniciarlo:"
    echo "  docker compose up -d loki"
    echo ""
    echo "Para ver los logs:"
    echo "  docker compose logs loki"
fi
