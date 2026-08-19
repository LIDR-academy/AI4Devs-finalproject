#!/usr/bin/env bash

# 🛡️ .agents Framework Integrity & Link Validator Script
set -euo pipefail

echo "🔍 Validando integridad del Framework .agents..."

# Check directories exist
for dir in workflows skills rules examples; do
  if [ ! -d ".agents/$dir" ]; then
    echo "❌ Error: Directorio faltante .agents/$dir"
    exit 1
  fi
done

echo "✅ Directorios principales verificados."

# Count Skills & Workflows
SKILLS_COUNT=$(find .agents/skills -name "*.md" | wc -l)
WORKFLOWS_COUNT=$(find .agents/workflows -name "*.md" | wc -l)

echo "📊 Total de Skills encontradas: $SKILLS_COUNT"
echo "📊 Total de Workflows encontrados: $WORKFLOWS_COUNT"

# Run self-tests for the audit tooling before trusting its verdict
echo "🧪 Ejecutando tests unitarios de las herramientas de auditoría..."
python3 -m unittest discover -s .agents/scripts/tests

# Run Link Integrity Checker
python3 .agents/scripts/check_links.py

echo "🎉 Arnés .agents verificado exitosamente sin errores de integridad ni enlaces rotos."
