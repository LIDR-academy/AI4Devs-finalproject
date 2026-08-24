#!/usr/bin/env bash

# Generado por SK-27 para: GitHub Actions (.github/workflows/) — ver docs/00_stack_manifest.md §6.
# No es portable verbatim a otra plataforma CI/CD sin volver a correr SK-27 (TK-038:
# .agents/scripts/ solo contiene tooling agnóstico; este script está acoplado a la
# plataforma CI/CD real de este proyecto y vive en el árbol del proyecto consumidor).
#
# TK-042 / Guard 25: Detecta drift entre las herramientas DevSecOps DECLARADAS en
# docs/00_stack_manifest.md §6 y las que están REALMENTE wireadas como steps en el
# pipeline CI/CD. Informativo, no bloqueante: declarar una herramienta sin wirearla es
# una alerta de gobernanza, no motivo para romper el build (mismo criterio que
# check_rules_freshness.sh).
set -uo pipefail

echo "🔄 Auditando cobertura DevSecOps: stack_manifest.md §6 vs pipeline CI/CD real..."
echo ""

MANIFEST="docs/00_stack_manifest.md"
CI_DIR=".github/workflows"
GAP_FOUND=0

if [ ! -f "$MANIFEST" ]; then
  echo "⚠️  $MANIFEST no encontrado. Omitiendo verificación."
  exit 0
fi

if [ ! -d "$CI_DIR" ]; then
  echo "⚠️  $CI_DIR no encontrado. Omitiendo verificación."
  exit 0
fi

# Herramientas DevSecOps declaradas en la tabla §6 del manifiesto que DEBEN aparecer
# como step ejecutable en el pipeline real. Regenerar esta lista (vía SK-27) si §6 cambia.
DEVSECOPS_TOOLS=("gitleaks" "trivy")

for tool in "${DEVSECOPS_TOOLS[@]}"; do
  if ! grep -qi "$tool" "$MANIFEST"; then
    continue # ya no está declarado en el manifiesto, nada que auditar
  fi

  if grep -rqi "$tool" "$CI_DIR"/*.yml 2>/dev/null; then
    echo "✅ '$tool' declarado en $MANIFEST y wireado en $CI_DIR/."
  else
    echo "⚠️  '$tool' está declarado en $MANIFEST §6 pero NO aparece en ningún step de $CI_DIR/ — Guard 25 violado."
    GAP_FOUND=1
  fi
done

echo ""
if [ "$GAP_FOUND" -eq 0 ]; then
  echo "✨ Cobertura DevSecOps alineada: todo lo declarado en el manifiesto está wireado en CI."
else
  echo "ℹ️  Hay herramientas DevSecOps declaradas sin wirear (ver arriba). No bloqueante — revisión humana recomendada antes del próximo release."
fi
