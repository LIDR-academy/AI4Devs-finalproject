#!/bin/bash

# Script para agregar Docker al PATH en macOS

echo "🔧 Configurando Docker en el PATH..."
echo ""

# Verificar si estamos en macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Este script es solo para macOS"
    exit 1
fi

# Ruta de Docker Desktop
DOCKER_APP="/Applications/Docker.app/Contents/Resources/bin"

if [ ! -d "$DOCKER_APP" ]; then
    echo "❌ Docker Desktop no encontrado en: $DOCKER_APP"
    echo ""
    echo "Por favor:"
    echo "1. Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/"
    echo "2. Abre Docker Desktop"
    exit 1
fi

echo "✅ Docker Desktop encontrado"
echo ""

# Agregar al PATH para esta sesión
export PATH="$DOCKER_APP:$PATH"

# Verificar que funciona
if command -v docker &> /dev/null; then
    echo "✅ Docker agregado al PATH (esta sesión)"
    echo "   Versión: $(docker --version)"
    echo ""
    
    # Verificar si Docker está corriendo
    if docker info &> /dev/null; then
        echo "✅ Docker está corriendo"
    else
        echo "⚠️  Docker Desktop no está corriendo"
        echo "   Por favor abre Docker Desktop y espera a que inicie"
    fi
else
    echo "❌ Error al agregar Docker al PATH"
    exit 1
fi

echo ""
echo "📝 Para hacer permanente este cambio, agrega esta línea a tu ~/.zshrc:"
echo ""
echo "   export PATH=\"/Applications/Docker.app/Contents/Resources/bin:\$PATH\""
echo ""
echo "Luego ejecuta: source ~/.zshrc"
echo ""
