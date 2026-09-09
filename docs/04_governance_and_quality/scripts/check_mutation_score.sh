#!/usr/bin/env bash

# Generado por SK-27 para: Stryker 8.x (@stryker-mutator/vitest-runner) + pnpm monorepo
# (apps/backend) — ver docs/00_stack_manifest.md. No es portable verbatim a otro motor de
# mutation testing sin volver a correr SK-27 (TK-038: .agents/scripts/ solo contiene
# tooling agnóstico; este script vive en el árbol del proyecto consumidor porque invoca
# `npx stryker` directamente, bloqueado explícitamente para .agents/scripts/*.sh por
# check_agnosticism.py).
#
# Automatiza Guard 11 ("Anti-Test Theater & Code Churn Guard" — Stryker Mutation Score
# >= 70%). Hallazgo que motivó este script (2026-08-31, auditoría de cobertura de
# guardas): apps/backend/stryker.conf.json y el script npm `test:mutation` ya existían,
# correctamente configurados (mutate: src/domain + src/application, thresholds.break: 70)
# — pero no estaban wireados a ningún lado; la guarda llevaba tiempo "cubierta" solo en
# apariencia, sin que nadie la corriera nunca.
#
# CORRECCIÓN (2026-08-31, AUDIT-DEV-002): la primera versión de este script invocaba
# Stryker UNA vez con todos los archivos tocados juntos en `--mutate` y confiaba en su
# código de salida. Eso esconde archivos débiles detrás de archivos fuertes: Stryker
# aplica `thresholds.break` solo al score AGREGADO de la corrida, nunca por archivo. Una
# auditoría real contra TK-077 lo confirmó en vivo: 3 archivos con 86.89% / 75.00% /
# 65.52% dieron 78.81% agregado (pasa) aunque el tercero, aislado, estaba genuinamente
# por debajo del umbral (65.52% < 70%, exit 1 al correrlo solo). Ahora se invoca Stryker
# UNA VEZ POR ARCHIVO tocado — cada invocación mutation-testea un solo archivo, así que
# el `thresholds.break` de Stryker se vuelve, por construcción, un umbral por archivo.
# Costo: N invocaciones en vez de 1 (más lento para tickets con muchos archivos), pero es
# el único diseño que no permite que un archivo compense a otro; se prefiere correcto y
# lento a rápido y silencioso.
# Verificado en vivo (2026-08-31): re-corrida per-file de los 3 archivos de TK-077 detecta
# correctamente el archivo débil (RequestAdminPinResetUseCase.ts, 65.52%, exit 1) que la
# versión agregada anterior no detectaba.
set -uo pipefail

collect_changed() {
  git diff --name-only --diff-filter=ACMR -- '*.ts'
  git diff --name-only --staged --diff-filter=ACMR -- '*.ts'
  git ls-files --others --exclude-standard -- '*.ts'
}

MUTATE_TARGETS=$(collect_changed | sort -u | grep -E '^apps/backend/src/(domain|application)/' | grep -v '\.test\.ts$' | sed 's#^apps/backend/##' || true)

echo "🔍 Verificando Guard 11 (Mutation Score Stryker >= 70%, por archivo) — acotado a domain/application tocados por el ticket en curso..."
echo ""

if [ -z "$MUTATE_TARGETS" ]; then
  echo "✨ El ticket en curso no toca archivos en apps/backend/src/{domain,application}/ — nada que mutar."
  exit 0
fi

echo "📄 Archivos a mutar (uno por uno, para que ninguno compense a otro):"
echo "$MUTATE_TARGETS" | sed 's/^/   - /'
echo ""

cd apps/backend || exit 1

FAILED_FILES=""
while IFS= read -r file; do
  [ -z "$file" ] && continue
  echo "▶️  Mutando: $file"
  if npx stryker run --mutate "$file" > /tmp/stryker_output_$$.log 2>&1; then
    echo "   ✅ OK"
  else
    echo "   ❌ Por debajo del umbral 70%"
    FAILED_FILES="${FAILED_FILES}${file}"$'\n'
    tail -30 /tmp/stryker_output_$$.log | sed 's/^/      /'
  fi
  rm -f /tmp/stryker_output_$$.log
  echo ""
done <<< "$MUTATE_TARGETS"

if [ -n "$FAILED_FILES" ]; then
  echo "❌ Mutation Score por debajo del umbral 70% (Guard 11) en:"
  echo "$FAILED_FILES" | sed '/^$/d' | sed 's/^/   - /'
  echo "   Revisa el reporte HTML en apps/backend/reports/mutation/ (se sobreescribe en cada corrida — mira el de la última falla) y refuerza los tests que no matan mutantes sobrevivientes."
  exit 1
fi

echo "✨ Mutation Score >= 70% en TODOS los archivos tocados por el ticket en curso (verificado por archivo, ninguno compensa a otro)."
