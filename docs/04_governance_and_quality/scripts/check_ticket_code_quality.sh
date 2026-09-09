#!/usr/bin/env bash

# Generado por SK-27 para: TypeScript + pnpm + ESLint 9.x (apps/backend, apps/frontend) —
# ver docs/00_stack_manifest.md. No es portable verbatim a otro stack/linter sin volver a
# correr SK-27 (TK-038: .agents/scripts/ solo contiene tooling agnóstico; los scripts
# acoplados al stack del proyecto viven aquí, generados, no en el payload portable).
#
# TK-037: Gate de complejidad/longitud/profundidad ACOTADO al diff del ticket en curso.
# Las reglas complexity/max-lines-per-function/max-depth son 'warn' globalmente en
# eslint.config.* (informativas, por deuda preexistente — ver docs/00_stack_manifest.md).
# Este script las hace bloqueantes de verdad, pero solo sobre los archivos que el ticket
# actual creó o modificó.
#
# Alcance = SOLO cambios sin commitear (working tree + staged), no diff contra una rama
# base: este proyecto no rama por ticket, todos los tickets son commits atómicos
# secuenciales sobre la misma rama (ver git_rules.md), y este gate corre en FASE 5,
# antes del commit de FASE 6 — el diff sin commitear ES el diff del ticket en curso. Una
# vez commiteado, ya no hay "diff del ticket actual" que verificar.
set -uo pipefail

collect_changed() {
  git diff --name-only --diff-filter=ACMR -- '*.ts' '*.tsx'
  git diff --name-only --staged --diff-filter=ACMR -- '*.ts' '*.tsx'
  git ls-files --others --exclude-standard -- '*.ts' '*.tsx'
}

CHANGED_FILES=$(collect_changed | sort -u)

if [ -z "$CHANGED_FILES" ]; then
  echo "✨ No hay archivos .ts/.tsx sin commitear. Nada que verificar (corre esto en FASE 5, antes del commit de FASE 6)."
  exit 0
fi

echo "🔍 Verificando complejidad/longitud/profundidad SOLO en archivos sin commitear del ticket en curso:"
echo "$CHANGED_FILES" | sed 's/^/   - /'
echo ""

FAILED=0

check_workspace() {
  local workspace_dir="$1"
  shift
  local files=("$@")
  [ ${#files[@]} -eq 0 ] && return 0

  local rel_files=()
  for f in "${files[@]}"; do
    [ -f "$f" ] || continue
    rel_files+=("${f#"$workspace_dir"/}")
  done
  [ ${#rel_files[@]} -eq 0 ] && return 0

  echo "▶ $workspace_dir: ${#rel_files[@]} archivo(s)"
  ( cd "$workspace_dir" && npx eslint "${rel_files[@]}" --max-warnings 0 )
}

mapfile -t BACKEND_FILES < <(echo "$CHANGED_FILES" | grep '^apps/backend/' || true)
mapfile -t FRONTEND_FILES < <(echo "$CHANGED_FILES" | grep '^apps/frontend/' || true)

check_workspace "apps/backend" "${BACKEND_FILES[@]}" || FAILED=1
check_workspace "apps/frontend" "${FRONTEND_FILES[@]}" || FAILED=1

echo ""
if [ "$FAILED" -ne 0 ]; then
  echo "❌ Archivos sin commitear de este ticket violan complexity/max-lines-per-function/max-depth. Refactoriza antes de cerrar el ticket."
  exit 1
fi

echo "✨ Archivos sin commitear de este ticket están limpios (complejidad/longitud/profundidad)."
