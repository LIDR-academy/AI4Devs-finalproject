#!/usr/bin/env bash

# Script agnóstico para auditar la velocidad de ejecución de la suite de pruebas unitarias.
set -e

echo "⏱️ Auditando velocidad de ejecución de la suite de pruebas..."

# Ejecución del runner configurado en el proyecto
if [ -f "package.json" ]; then
  echo "📊 Verificando suite de Vitest/Jest..."
  pnpm test -- --reporter=verbose 2>&1 | grep -E "([0-9]+ ms)" || true
fi

echo "✨ Profiling de la suite de pruebas completado."
