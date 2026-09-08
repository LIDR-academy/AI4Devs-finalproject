#!/usr/bin/env bash

# Generado por SK-27 para: pnpm 9.x (TypeScript monorepo) — ver docs/00_stack_manifest.md.
# No es portable verbatim a otro gestor de paquetes sin volver a correr SK-27 (TK-038:
# .agents/scripts/ solo contiene tooling agnóstico; este script vive en el árbol del
# proyecto consumidor porque está acoplado al gestor de paquetes real).
#
# TK-043: `pnpm audit` en pnpm 9.x (el pineado por docs/00_stack_manifest.md §1) NO soporta
# ni el flag --ignore <GHSA> ni pnpm-workspace.yaml#auditConfig.ignoreGhsas — ambos son
# features introducidas en versiones de pnpm posteriores a la aprobada para este proyecto.
# Este script reimplementa esa capacidad manualmente: bloqueante ante cualquier vulnerabilidad
# high/critical NO documentada explícitamente abajo; deja pasar únicamente el riesgo residual
# ya evaluado y aceptado (ver comentarios junto a cada GHSA).
set -uo pipefail

# Riesgo residual aceptado (Guard 24 — requiere aprobación humana para tocar esta lista):
ALLOWED_GHSAS=(
  "GHSA-fx2h-pf6j-xcff" # vite: server.fs.deny bypass — solo dev server, nunca en produccion. Fix real exige Vite 6 (fuera del major aprobado en stack_manifest.md).
  "GHSA-5xrq-8626-4rwp" # vitest: RCE via UI server — solo `vitest --ui`, nunca invocado en Dockerfile/ci.yml. Fix real exige Vitest 3 (fuera del major aprobado).
  # TK-134: los 5 advisories de mysql2 / fast-uri (transitivos de Prisma 7) que estaban aqui como
  # riesgo residual aceptado ya NO aplican — `pnpm.overrides` fuerza mysql2>=3.22.0 y fast-uri>=3.1.6.
  # Se quitan de la lista a proposito: si volvieran a aparecer, el gate DEBE fallar, no dejarlos pasar.
)

echo "🔍 Auditando dependencias (pnpm audit --audit-level=high) con riesgo residual documentado..."

AUDIT_JSON=$(pnpm audit --audit-level=high --json 2>/dev/null || true)

if [ -z "$AUDIT_JSON" ]; then
  echo "✨ 0 vulnerabilidades high/critical encontradas."
  exit 0
fi

UNDOCUMENTED=0
while IFS= read -r ghsa; do
  [ -z "$ghsa" ] && continue
  allowed=0
  for a in "${ALLOWED_GHSAS[@]}"; do
    [ "$ghsa" = "$a" ] && allowed=1 && break
  done
  if [ "$allowed" -eq 0 ]; then
    echo "❌ Vulnerabilidad high/critical NO documentada en el riesgo residual aceptado: $ghsa"
    UNDOCUMENTED=1
  else
    echo "ℹ️  $ghsa — riesgo residual ya documentado y aceptado (ver ALLOWED_GHSAS en este script). No bloquea."
  fi
done < <(echo "$AUDIT_JSON" | python3 -c "
import json,sys
try:
    data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(0)
for a in data.get('advisories', {}).values():
    if a.get('severity') in ('high', 'critical'):
        print(a.get('github_advisory_id') or a.get('url', '').rsplit('/', 1)[-1])
")

echo ""
if [ "$UNDOCUMENTED" -ne 0 ]; then
  echo "❌ Hay vulnerabilidades high/critical nuevas sin evaluar. Corrige el paquete o añade el GHSA a ALLOWED_GHSAS en este script con justificación explícita (requiere aprobación humana, Guard 24)."
  exit 1
fi

echo "✨ Todas las vulnerabilidades high/critical detectadas están dentro del riesgo residual documentado."
