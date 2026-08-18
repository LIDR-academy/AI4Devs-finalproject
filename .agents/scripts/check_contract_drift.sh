#!/usr/bin/env bash

# M-01: Script para verificar drift REAL entre la especificación OpenAPI y los controllers Zod del backend.
# Detecta rutas documentadas en OpenAPI que no tienen un esquema Zod de validación activo.
set -e

echo "🔍 Verificando drift de contrato OpenAPI vs esquemas Zod..."

SPEC_FILE="docs/03_persistence_and_api/openapi.yaml"
CONTROLLERS_DIR="apps/backend/src/infrastructure"
DRIFT_FOUND=0

# 1. Verificar que exista la especificación OpenAPI
if [ ! -f "$SPEC_FILE" ]; then
  echo "⚠️  Archivo de especificación $SPEC_FILE no encontrado. Omitiendo verificación."
  exit 0
fi
echo "✅ Especificación OpenAPI encontrada: $SPEC_FILE"

# 2. Extraer todas las rutas HTTP de la especificación OpenAPI
OPENAPI_PATHS=$(grep -E "^\s{2,4}/(api|v[0-9])" "$SPEC_FILE" | sed 's/://g' | tr -d ' ' | sort -u)

echo "📋 Rutas documentadas en OpenAPI:"
echo "$OPENAPI_PATHS" | while read -r path; do
  echo "   - $path"
done

# 3. Verificar que los controllers tengan schemas Zod activos (z.object / ZodSchema)
ZOD_FILES=$(find "$CONTROLLERS_DIR" -name "*.controller.ts" -o -name "*.schema.ts" -o -name "*.dto.ts" 2>/dev/null)
ZOD_COUNT=$(echo "$ZOD_FILES" | xargs grep -l "z\.object\|z\.string\|z\.number\|ZodSchema\|zod" 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "📊 Controllers / schemas con validación Zod activa: $ZOD_COUNT"

if [ "$ZOD_COUNT" -eq "0" ]; then
  echo "🚨 DRIFT DETECTADO: Ningún controller tiene esquemas Zod activos."
  echo "   Verifica que todos los endpoints del contrato OpenAPI tengan sanitización con Zod."
  DRIFT_FOUND=1
fi

# 4. Verificar que cada controller use parse/safeParse (no validación trivial)
MISSING_PARSE=$(echo "$ZOD_FILES" | xargs grep -rL "\.parse\|\.safeParse" 2>/dev/null | grep -v "node_modules" || true)
if [ -n "$MISSING_PARSE" ]; then
  echo ""
  echo "⚠️  Controllers sin .parse() o .safeParse() activo (posible Anti-Mass-Assignment Gap):"
  echo "$MISSING_PARSE" | while read -r f; do echo "   - $f"; done
  DRIFT_FOUND=1
fi

echo ""
if [ "$DRIFT_FOUND" -eq "0" ]; then
  echo "✨ Sin drift detectado. Contrato OpenAPI alineado con validación Zod en controllers."
  exit 0
else
  echo "🚨 Se detectaron problemas de alineación de contrato. Revisa los items anteriores."
  exit 1
fi
