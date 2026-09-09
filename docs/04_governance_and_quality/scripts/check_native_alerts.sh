#!/usr/bin/env bash

# Generado por SK-27 para: React 18 + TSX (apps/frontend) — ver docs/00_stack_manifest.md.
# No es portable verbatim a otro framework de UI sin volver a correr SK-27 (TK-038:
# .agents/scripts/ solo contiene tooling agnóstico; este script vive en el árbol del
# proyecto consumidor porque su patrón de búsqueda depende de JSX/TSX, bloqueado
# explícitamente para .agents/scripts/*.sh por check_agnosticism.py).
#
# Automatiza Guard 38 ("Anti-Native-Alert & Centralized Error UX Guard", TK-071):
# prohibe window.alert()/window.confirm() en componentes frontend. Solo cubre la mitad
# "nativa" de la guarda (llamadas reales, no substrings en comentarios/strings — el regex
# exige el paréntesis de apertura inmediatamente después); la otra mitad ("raw technical
# error strings... mandatory parsing via errorMessageMapper.ts") requiere criterio humano
# para distinguir un string técnico real de un mensaje de UI legítimo y no se automatiza
# aquí. Una auditoría manual (2026-08-31) encontró 2 violaciones preexistentes
# (RolesManagementModal.tsx, LocationsManagementModal.tsx) que ya fueron corregidas con
# un ConfirmModal reutilizable — mismo patrón acotado a diff que check_dead_code.sh para
# no romper CI ante una futura regresión aislada.
set -uo pipefail

collect_changed() {
  git diff --name-only --diff-filter=ACMR -- '*.tsx' '*.jsx'
  git diff --name-only --staged --diff-filter=ACMR -- '*.tsx' '*.jsx'
  git ls-files --others --exclude-standard -- '*.tsx' '*.jsx'
}

CHANGED_FILES=$(collect_changed | sort -u)

ALL_FILES=$( { git ls-files -- 'apps/frontend/src/**/*.tsx' 'apps/frontend/src/**/*.jsx'; git ls-files --others --exclude-standard -- 'apps/frontend/src/**/*.tsx' 'apps/frontend/src/**/*.jsx'; } 2>/dev/null | sort -u)

echo "🔍 Verificando Guard 38 (sin window.alert/window.confirm nativos) — repo completo, informativo en archivos fuera del diff..."
echo ""

if [ -z "$ALL_FILES" ]; then
  echo "✨ No hay archivos .tsx/.jsx en apps/frontend/src/ — nada que verificar."
  exit 0
fi

blocking_count=0
informative_count=0

while IFS= read -r file; do
  [ -f "$file" ] || continue
  while IFS=: read -r line_no match; do
    [ -z "$line_no" ] && continue
    msg="${file}:${line_no} — ${match# } (Guard 38: usar ConfirmModal/ErrorBanner en vez de window.alert/window.confirm)"
    if printf '%s\n' "$CHANGED_FILES" | grep -qxF "$file"; then
      echo "❌ $msg"
      blocking_count=$((blocking_count + 1))
    else
      echo "ℹ️  $msg (deuda preexistente, no bloquea)"
      informative_count=$((informative_count + 1))
    fi
  done < <(grep -nE 'window\.(alert|confirm)\s*\(' "$file" || true)
done <<< "$ALL_FILES"

echo ""
if [ "$informative_count" -gt 0 ]; then
  echo "📊 ${informative_count} hallazgo(s) preexistente(s) fuera del diff del ticket — informativo, no bloquea."
fi

if [ "$blocking_count" -gt 0 ]; then
  echo ""
  echo "❌ El ticket en curso introduce/toca window.alert()/window.confirm() (Guard 38). Reemplaza por ConfirmModal (shared/components/ConfirmModal.tsx) o un banner inline no bloqueante."
  exit 1
fi

echo "✨ Ningún archivo tocado por el ticket en curso introduce alertas nativas nuevas."
