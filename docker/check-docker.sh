#!/bin/bash

echo "🔍 Verificando instalación de Docker..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker no está en el PATH"
    echo ""
    
    # Verificar si Docker Desktop está instalado en macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        DOCKER_APP="/Applications/Docker.app/Contents/Resources/bin/docker"
        if [ -f "$DOCKER_APP" ]; then
            echo "✅ Docker Desktop encontrado en: $DOCKER_APP"
            echo ""
            echo "🔧 Solución:"
            echo ""
            echo "1. Abre Docker Desktop desde Aplicaciones"
            echo "2. Espera a que el ícono de Docker aparezca en la barra de menú"
            echo "3. Cierra esta terminal y abre una NUEVA terminal"
            echo "4. O ejecuta este comando para agregar Docker al PATH en esta sesión:"
            echo ""
            echo "   export PATH=\"/Applications/Docker.app/Contents/Resources/bin:\$PATH\""
            echo ""
            echo "5. Luego verifica:"
            echo "   docker --version"
            echo ""
            read -p "¿Deseas agregar Docker al PATH ahora? (s/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
                echo "✅ PATH actualizado para esta sesión"
                echo ""
            else
                echo "Por favor, cierra y vuelve a abrir la terminal, o ejecuta el comando export manualmente"
                exit 1
            fi
        else
            echo "❌ Docker Desktop no encontrado en la ubicación estándar"
            echo ""
            echo "Solución:"
            echo "1. Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/"
            echo "2. Abre Docker Desktop y espera a que inicie completamente"
            echo "3. Cierra y vuelve a abrir la terminal"
            exit 1
        fi
    else
        echo "❌ Docker no está instalado o no está en el PATH"
        echo ""
        echo "Solución:"
        echo "1. Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/"
        echo "2. Abre Docker Desktop y espera a que inicie completamente"
        echo "3. Cierra y vuelve a abrir la terminal"
        exit 1
    fi
fi

echo "✅ Docker encontrado: $(docker --version)"
echo ""

# Verificar si Docker está corriendo
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo"
    echo ""
    echo "Solución:"
    echo "1. Abre Docker Desktop"
    echo "2. Espera a que el ícono de Docker aparezca en la barra de menú"
    echo "3. Verifica que el estado sea 'Running'"
    exit 1
fi

echo "✅ Docker está corriendo"
echo ""

# Verificar Docker Compose
if docker compose version &> /dev/null; then
    echo "✅ Docker Compose (moderno) disponible: $(docker compose version)"
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    echo "⚠️  Docker Compose (antiguo) encontrado: $(docker-compose --version)"
    echo "   Se recomienda actualizar a Docker Desktop para usar 'docker compose'"
    COMPOSE_CMD="docker-compose"
else
    echo "❌ Docker Compose no está disponible"
    echo ""
    echo "Solución:"
    echo "1. Actualiza Docker Desktop a la última versión"
    echo "2. O instala docker-compose: brew install docker-compose"
    exit 1
fi

echo ""
echo "📋 Comando a usar: $COMPOSE_CMD"
echo ""
echo "✅ Todo listo! Puedes ejecutar:"
echo "   $COMPOSE_CMD up -d"
echo ""
