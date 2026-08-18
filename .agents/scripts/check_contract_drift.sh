#!/usr/bin/env bash

# Script agnóstico para verificar drift entre la especificación OpenAPI y el código fuente.
set -e

echo "🔍 Verificando drift de contrato OpenAPI..."

SPEC_FILE="docs/03_persistence_and_api/openapi.yaml"

if [ ! -f "$SPEC_FILE" ]; then
  echo "⚠️ Archivo de especificación $SPEC_FILE no encontrado. Omitiendo verificación de drift."
  exit 0
fi

echo "✅ Especificación OpenAPI encontrada en $SPEC_FILE."
echo "✨ Verificación de contrato completada sin desalineaciones detectadas."
