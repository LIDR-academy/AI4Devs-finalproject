#!/bin/bash

echo "🚀 Verificando y configurando Docker Desktop..."
echo ""

# Verificar si Docker está en el PATH
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker no está en el PATH"
    
    # Intentar agregar Docker al PATH en macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        DOCKER_PATH="/Applications/Docker.app/Contents/Resources/bin"
        if [ -d "$DOCKER_PATH" ]; then
            export PATH="$DOCKER_PATH:$PATH"
            echo "✅ Docker agregado al PATH para esta sesión"
        else
            echo "❌ Docker Desktop no encontrado en la ubicación estándar"
            echo ""
            echo "Por favor:"
            echo "1. Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/"
            echo "2. Abre Docker Desktop"
            exit 1
        fi
    fi
fi

# Verificar que Docker Desktop esté corriendo
echo "🔍 Verificando que Docker Desktop esté corriendo..."
if docker info &> /dev/null; then
    echo "✅ Docker Desktop está corriendo"
    echo ""
    docker info | grep -E "Server Version|Operating System" | head -2
    echo ""
    echo "✅ Todo listo! Puedes ejecutar: docker compose up -d"
    exit 0
else
    echo "❌ Docker Desktop NO está corriendo"
    echo ""
    echo "📋 Pasos para iniciar Docker Desktop:"
    echo ""
    echo "1. Abre Docker Desktop desde Aplicaciones en macOS"
    echo "   O ejecuta: open -a Docker"
    echo ""
    echo "2. Espera a que Docker Desktop inicie completamente"
    echo "   - Verás el ícono de Docker (🐳) en la barra de menú superior"
    echo "   - El ícono debe estar verde cuando esté listo"
    echo "   - Esto puede tardar 30-60 segundos"
    echo ""
    echo "3. Verifica que esté corriendo:"
    echo "   - Pasa el mouse sobre el ícono de Docker"
    echo "   - Debe mostrar 'Docker Desktop is running'"
    echo ""
    echo "4. Luego ejecuta este script de nuevo:"
    echo "   ./iniciar-docker.sh"
    echo ""
    
    # Intentar abrir Docker Desktop automáticamente
    if [[ "$OSTYPE" == "darwin"* ]]; then
        read -p "¿Deseas abrir Docker Desktop ahora? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            echo "Abriendo Docker Desktop..."
            open -a Docker
            echo ""
            echo "⏳ Espera 30-60 segundos a que Docker Desktop inicie..."
            echo "   Luego ejecuta este script de nuevo para verificar"
        fi
    fi
    
    exit 1
fi
