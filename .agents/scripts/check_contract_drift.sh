#!/usr/bin/env bash

# M-01: Script para verificar drift REAL entre la especificación OpenAPI y los controllers Zod del backend.
# Detecta rutas documentadas en OpenAPI que no tienen un esquema Zod de validación activo.
set -euo pipefail

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

# 3. Localizar controllers/schemas con Zod activo y mapearlos por módulo de dominio
#    (el nombre de archivo, ej. kitchen.controller.ts, es el heurístico de módulo)
ZOD_FILES=$(find "$CONTROLLERS_DIR" -name "*.controller.ts" -o -name "*.schema.ts" -o -name "*.dto.ts" 2>/dev/null)
ZOD_MODULES=$(echo "$ZOD_FILES" | xargs grep -l "z\.object\|z\.string\|z\.number\|ZodSchema\|zod" 2>/dev/null \
  | xargs -n1 basename 2>/dev/null | sed -E 's/\.(controller|schema|dto)\.ts$//' | sort -u)
ZOD_COUNT=$(echo "$ZOD_MODULES" | grep -c . || true)

echo ""
echo "📊 Módulos con validación Zod activa: $ZOD_COUNT ($(echo "$ZOD_MODULES" | tr '\n' ' '))"

if [ "$ZOD_COUNT" -eq "0" ]; then
  echo "🚨 DRIFT DETECTADO: Ningún controller tiene esquemas Zod activos."
  echo "   Verifica que todos los endpoints del contrato OpenAPI tengan sanitización con Zod."
  DRIFT_FOUND=1
fi

# 3b. Por cada ruta OpenAPI, verificar que su módulo de dominio (2do segmento de /api/{modulo}/...)
#     tenga al menos un controller/schema con Zod activo (heurístico por-ruta, no solo global)
UNMAPPED_MODULES=""
for path in $OPENAPI_PATHS; do
  # /api/{modulo}/... o /api/v{N}/{modulo}/... — se salta el segmento de versión si existe
  module=$(echo "$path" | awk -F'/' '{ seg=$3; if (seg ~ /^v[0-9]+$/) seg=$4; print seg }')
  if [ -n "$module" ] && ! echo "$ZOD_MODULES" | grep -qx "$module"; then
    if ! echo "$UNMAPPED_MODULES" | grep -qw "$module"; then
      UNMAPPED_MODULES="$UNMAPPED_MODULES $module"
    fi
  fi
done

if [ -n "$(echo "$UNMAPPED_MODULES" | tr -d ' ')" ]; then
  echo ""
  echo "🚨 DRIFT DETECTADO: rutas OpenAPI sin controller/schema Zod correspondiente para el módulo:"
  for m in $UNMAPPED_MODULES; do echo "   - /api/$m/*"; done
  echo "   (heurístico: busca un archivo *.controller.ts/*.schema.ts/*.dto.ts llamado '\$modulo' con Zod activo)"
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
