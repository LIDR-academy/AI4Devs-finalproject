#!/bin/bash

# Script para diagnosticar y solucionar problemas de puertos ocupados

echo "🔍 Diagnosticando puertos ocupados..."
echo ""

# Función para verificar puerto
check_port() {
    local port=$1
    local service=$2
    
    echo "Verificando puerto $port ($service)..."
    
    if lsof -i :$port &> /dev/null; then
        echo "⚠️  Puerto $port está en uso:"
        lsof -i :$port
        echo ""
        return 1
    else
        echo "✅ Puerto $port está libre"
        echo ""
        return 0
    fi
}

# Verificar puertos principales
PORTS_OCCUPIED=0

check_port 5432 "PostgreSQL" || PORTS_OCCUPIED=1
check_port 6379 "Redis" || PORTS_OCCUPIED=1
check_port 8080 "Keycloak" || PORTS_OCCUPIED=1
check_port 8042 "Orthanc" || PORTS_OCCUPIED=1
check_port 9000 "MinIO" || PORTS_OCCUPIED=1
check_port 9001 "MinIO Console" || PORTS_OCCUPIED=1
check_port 9090 "Prometheus" || PORTS_OCCUPIED=1
check_port 3001 "Grafana" || PORTS_OCCUPIED=1

if [ $PORTS_OCCUPIED -eq 0 ]; then
    echo "✅ Todos los puertos están libres!"
    exit 0
fi

echo ""
echo "🔧 Soluciones:"
echo ""
echo "Opción 1: Detener procesos que usan los puertos"
echo "   Ejecuta: kill -9 <PID>  (reemplaza <PID> con el número del proceso)"
echo ""
echo "Opción 2: Detener contenedores Docker existentes"
echo "   Ejecuta: docker ps -a"
echo "   Luego:   docker stop <container_id>"
echo "   O:       docker compose down"
echo ""
echo "Opción 3: Cambiar puertos en docker-compose.yml"
echo "   Edita docker-compose.yml y cambia los puertos externos"
echo "   Ejemplo: '5432:5432' -> '5433:5432'"
echo ""

read -p "¿Deseas detener contenedores Docker existentes? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "Deteniendo contenedores Docker..."
    docker ps -a --filter "name=sigq-" --format "{{.Names}}" | xargs -r docker stop
    docker ps -a --filter "name=sigq-" --format "{{.Names}}" | xargs -r docker rm
    echo "✅ Contenedores detenidos"
    echo ""
    echo "Ahora puedes ejecutar: docker compose up -d"
fi
