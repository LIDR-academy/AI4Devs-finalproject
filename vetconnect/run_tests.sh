#!/bin/bash
# Script para ejecutar los tests después de las correcciones

set -e

cd "$(dirname "$0")"

echo "=========================================="
echo "Ejecutando Tests RSpec - VetConnect"
echo "=========================================="
echo ""

# Verificar que bundle esté disponible
if ! command -v bundle &> /dev/null; then
    echo "❌ Error: bundle no está disponible"
    exit 1
fi

# Verificar que las dependencias estén instaladas
echo "📦 Verificando dependencias..."
if ! bundle check &> /dev/null; then
    echo "⚠️  Dependencias no instaladas. Ejecutando bundle install..."
    bundle install
fi

echo ""
echo "🧪 Ejecutando tests..."
echo ""

# Ejecutar tests con formato detallado
bundle exec rspec --format documentation --format progress

echo ""
echo "=========================================="
echo "Tests completados"
echo "=========================================="
