#!/usr/bin/env bash

# M-05: Detecta drift entre las reglas dinámicas (docs/04_governance_and_quality/rules/,
# extraídas por SK-27) y los documentos fuente de los que se derivan. Informativo, no bloqueante:
# un doc fuente más reciente que su regla derivada no es necesariamente un bug, pero merece revisión.
set -uo pipefail

echo "🔄 Auditando frescura de reglas dinámicas vs documentos fuente..."
echo ""

RULES_DIR="docs/04_governance_and_quality/rules"
STALE_FOUND=0

if [ ! -d "$RULES_DIR" ]; then
  echo "⚠️  $RULES_DIR no encontrado. Omitiendo verificación (proyecto sin SK-27 ejecutado aún)."
  exit 0
fi

last_commit_epoch() {
  git log -1 --format=%ct -- "$1" 2>/dev/null || echo ""
}

check_pair() {
  local rule_file="$1"
  shift
  local sources=("$@")

  [ -f "$rule_file" ] || return 0

  local rule_ts
  rule_ts=$(last_commit_epoch "$rule_file")
  [ -n "$rule_ts" ] || return 0

  for src in "${sources[@]}"; do
    [ -f "$src" ] || continue
    local src_ts
    src_ts=$(last_commit_epoch "$src")
    [ -n "$src_ts" ] || continue
    if [ "$src_ts" -gt "$rule_ts" ]; then
      echo "⚠️  Posible drift: '$src' cambió después que '$rule_file' — revisa si SK-27 debe re-extraer reglas."
      STALE_FOUND=1
    fi
  done
}

check_pair "$RULES_DIR/domain_rules.md" "docs/02_architecture_design/03_domain_model.md"
check_pair "$RULES_DIR/backend_rules.md" "docs/02_architecture_design/04_technical_design.md" "docs/03_persistence_and_api/07_api_specification.md"
check_pair "$RULES_DIR/frontend_rules.md" "docs/02_architecture_design/05_ui_ux_design_system.md"
check_pair "$RULES_DIR/database_rules.md" "docs/03_persistence_and_api/06_database_schema.md"
check_pair "$RULES_DIR/security_rules.md" "docs/04_governance_and_quality/08_security_strategy.md"
check_pair "$RULES_DIR/testing_rules.md" "docs/04_governance_and_quality/09_testing_strategy.md"
check_pair "$RULES_DIR/git_rules.md" "AGENTS.md"

echo ""
if [ "$STALE_FOUND" -eq "0" ]; then
  echo "✨ Reglas dinámicas alineadas con sus documentos fuente."
else
  echo "ℹ️  Hay documentos fuente más recientes que su regla derivada (ver arriba). No bloqueante — revisión humana recomendada."
fi
