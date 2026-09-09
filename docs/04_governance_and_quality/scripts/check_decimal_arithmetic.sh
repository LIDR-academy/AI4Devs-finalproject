#!/usr/bin/env bash

# Generado por SK-27 para: Node.js + TypeScript + decimal.js (apps/backend) — ver
# docs/00_stack_manifest.md. No es portable verbatim a otro stack sin volver a correr
# SK-27 (TK-038: .agents/scripts/ solo contiene tooling agnóstico; este script vive en el
# árbol del proyecto consumidor porque su patrón de búsqueda depende del layout real de
# capas hexagonales del backend, bloqueado explícitamente para .agents/scripts/*.sh por
# check_agnosticism.py).
#
# Automatiza Guard 17 ("Strict Arbitrary-Precision Arithmetic Guard"): prohibe
# `parseFloat()` en las capas domain/application/infrastructure del backend, donde
# cualquier cantidad física de stock o costo DEBE pasar por DecimalQuantity/decimal.js.
# Heurística deliberadamente acotada a `parseFloat(` — es la señal más específica y de
# menor falso-positivo del patrón prohibido (a diferencia de operadores +/-/*// primitivos
# sueltos, que también aparecen legítimamente en contadores de bucle, índices de array,
# etc. y generarían ruido inmanejable). `Number(...)` NO se marca por el mismo motivo
# (se usa legítimamente para parsear config no-monetaria, ej. minutos de timeout);
# revisar manualmente si un `Number(...)` nuevo envuelve una cantidad física o un costo.
# Verificado en vivo (2026-08-31): 0 ocurrencias de `parseFloat(` en apps/backend/src/
# fuera de tests — el backend ya cumple, este script blinda que se mantenga así.
set -uo pipefail

collect_changed() {
  git diff --name-only --diff-filter=ACMR -- '*.ts'
  git diff --name-only --staged --diff-filter=ACMR -- '*.ts'
  git ls-files --others --exclude-standard -- '*.ts'
}

CHANGED_FILES=$(collect_changed | sort -u | grep -E '^apps/backend/src/(domain|application|infrastructure)/' | grep -v '\.test\.ts$' || true)

ALL_FILES=$( { git ls-files -- 'apps/backend/src/domain/**/*.ts' 'apps/backend/src/application/**/*.ts' 'apps/backend/src/infrastructure/**/*.ts'; git ls-files --others --exclude-standard -- 'apps/backend/src/domain/**/*.ts' 'apps/backend/src/application/**/*.ts' 'apps/backend/src/infrastructure/**/*.ts'; } 2>/dev/null | grep -v '\.test\.ts$' | sort -u)

echo "🔍 Verificando Guard 17 (sin parseFloat en domain/application/infrastructure del backend) — repo completo, informativo en archivos fuera del diff..."
echo ""

if [ -z "$ALL_FILES" ]; then
  echo "✨ No hay archivos .ts en apps/backend/src/{domain,application,infrastructure}/ — nada que verificar."
  exit 0
fi

blocking_count=0
informative_count=0

while IFS= read -r file; do
  [ -f "$file" ] || continue
  while IFS=: read -r line_no match; do
    [ -z "$line_no" ] && continue
    msg="${file}:${line_no} — ${match# } (Guard 17: usar DecimalQuantity/decimal.js, nunca parseFloat, para cantidades físicas o costos)"
    if printf '%s\n' "$CHANGED_FILES" | grep -qxF "$file"; then
      echo "❌ $msg"
      blocking_count=$((blocking_count + 1))
    else
      echo "ℹ️  $msg (deuda preexistente, no bloquea)"
      informative_count=$((informative_count + 1))
    fi
  done < <(grep -n 'parseFloat(' "$file" || true)
done <<< "$ALL_FILES"

echo ""
if [ "$informative_count" -gt 0 ]; then
  echo "📊 ${informative_count} hallazgo(s) preexistente(s) fuera del diff del ticket — informativo, no bloquea."
fi

if [ "$blocking_count" -gt 0 ]; then
  echo ""
  echo "❌ El ticket en curso introduce/toca parseFloat() en una capa backend (Guard 17). Usa DecimalQuantity.fromString()/decimal.js en su lugar."
  exit 1
fi

echo "✨ Ningún archivo tocado por el ticket en curso introduce parseFloat() en el backend."
