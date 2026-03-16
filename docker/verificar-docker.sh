#!/bin/bash

echo "🔍 Verificando Docker Desktop..."
echo ""

# Verificar si Docker está en el PATH
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker no está en el PATH"
    
    # Intentar agregar Docker al PATH en macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
        echo "✅ Intentando agregar Docker al PATH..."
    fi
    
    # Verificar de nuevo
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker no encontrado"
        echo ""
        echo "Solución:"
        echo "1. Abre Docker Desktop desde Aplicaciones"
        echo "2. Espera a que el ícono aparezca en la barra de menú"
        echo "3. Cierra y vuelve a abrir la terminal"
        exit 1
    fi
fi

echo "✅ Docker encontrado: $(docker --version)"
echo ""

# Verificar que Docker Desktop esté corriendo
echo "🔍 Verificando que Docker Desktop esté corriendo..."
if docker info &> /dev/null; then
    echo "✅ Docker Desktop está corriendo"
    echo ""
    echo "📊 Información del Docker:"
    docker info | grep -E "Server Version|Operating System|Kernel Version" | head -3
    echo ""
    echo "✅ Todo listo! Puedes ejecutar: docker compose up -d"
else
    echo "❌ Docker Desktop NO está corriendo"
    echo ""
    echo "Solución:"
    echo "1. Abre Docker Desktop desde Aplicaciones"
    echo "2. Espera a que el ícono de Docker aparezca en la barra de menú"
    echo "3. El ícono debe mostrar 'Docker Desktop is running'"
    echo ""
    echo "Verifica que Docker Desktop esté abierto y vuelve a ejecutar este script"
    exit 1
fi
