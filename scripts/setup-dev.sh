#!/bin/bash

# Script maestro para configurar el entorno de desarrollo completo

set -e  # Salir si cualquier comando falla

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Configurando entorno de desarrollo completo para Covoituraje Corporativo..."
echo ""

# Función para verificar dependencias
check_dependencies() {
    echo "🔍 Verificando dependencias..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker no está instalado"
        exit 1
    fi
    
    # Verificar y arrancar Docker si es necesario
    source "${SCRIPT_DIR}/lib/docker-check.sh"
    check_and_start_docker || exit 1
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose no está instalado"
        exit 1
    fi
    
    if ! command -v mvn &> /dev/null; then
        echo "❌ Maven no está instalado"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo "⚠️ jq no está instalado (necesario para configuración de Keycloak)"
        echo "Instala jq para continuar: brew install jq (macOS) o apt-get install jq (Ubuntu)"
        exit 1
    fi
    
    echo "✅ Todas las dependencias están instaladas"
}

# Función para limpiar contenedores existentes
cleanup() {
    echo "🧹 Limpiando contenedores existentes..."
    docker-compose down --remove-orphans
    docker system prune -f
}

# Función para levantar infraestructura
setup_infrastructure() {
    echo "🏗️ Configurando infraestructura..."
    ./scripts/dev-infra.sh
}

# Función para ejecutar migraciones
run_migrations() {
    echo "📊 Ejecutando migraciones de base de datos..."
    ./scripts/migrate.sh
}

# Función para configurar Keycloak
setup_keycloak() {
    echo "🔐 Configurando Keycloak..."
    ./scripts/setup-keycloak.sh
}

# Función principal
main() {
    check_dependencies
    cleanup
    setup_infrastructure
    run_migrations
    setup_keycloak
    
    echo ""
    echo "🎉 ¡Entorno de desarrollo configurado exitosamente!"
    echo ""
    echo "📋 Servicios disponibles:"
    echo "📊 PostgreSQL: localhost:5433 (app/app)"
    echo "🔐 Keycloak: http://localhost:8080 (admin/admin)"
    echo "📧 Mailhog: http://localhost:8025"
    echo "🗄️ Redis: localhost:6379"
    echo ""
    echo "👤 Usuario de prueba:"
    echo "   Usuario: test.user"
    echo "   Contraseña: password123"
    echo ""
    echo "🚀 Para levantar los microservicios:"
    echo "   docker-compose --profile services up -d"
    echo ""
    echo "🌐 Para levantar el frontend:"
    echo "   docker-compose --profile services up frontend"
    echo ""
    echo "📚 Documentación completa en: doc/setup/local.md"
}

# Ejecutar función principal
main
