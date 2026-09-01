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
# apariencia, sin que nadie la corriera nunca. Correr Stryker contra TODO el árbol en cada
# ticket es demasiado lento (multiplica el tiempo de la suite de tests por cada mutante,
# ~1 min solo para un Value Object de 40 líneas en la corrida de verificación en vivo);
# se acota a los archivos domain/application realmente tocados por el ticket vía el flag
# nativo `--mutate` de Stryker, que soporta una lista separada por comas overrideando el
# `mutate` de stryker.conf.json. Stryker mismo aplica `thresholds.break` (70) y devuelve
# codigo de salida no-cero si no se alcanza — este script no reimplementa ese parseo,
# solo acota el alcance y delega el veredicto a Stryker.
# Verificado en vivo (2026-08-31): `npx stryker run --mutate "src/domain/auth/value-objects/Pin.ts"`
# corrio real contra el repo, score 81.82% >= 70%, exit 0.
set -uo pipefail

collect_changed() {
  git diff --name-only --diff-filter=ACMR -- '*.ts'
  git diff --name-only --staged --diff-filter=ACMR -- '*.ts'
  git ls-files --others --exclude-standard -- '*.ts'
}

MUTATE_TARGETS=$(collect_changed | sort -u | grep -E '^apps/backend/src/(domain|application)/' | grep -v '\.test\.ts$' | sed 's#^apps/backend/##' || true)

echo "🔍 Verificando Guard 11 (Mutation Score Stryker >= 70%) — acotado a domain/application tocados por el ticket en curso..."
echo ""

if [ -z "$MUTATE_TARGETS" ]; then
  echo "✨ El ticket en curso no toca archivos en apps/backend/src/{domain,application}/ — nada que mutar."
  exit 0
fi

echo "📄 Archivos a mutar:"
echo "$MUTATE_TARGETS" | sed 's/^/   - /'
echo ""

MUTATE_CSV=$(echo "$MUTATE_TARGETS" | paste -sd, -)

cd apps/backend || exit 1
npx stryker run --mutate "$MUTATE_CSV"
STATUS=$?

echo ""
if [ "$STATUS" -ne 0 ]; then
  echo "❌ Mutation Score por debajo del umbral 70% (Guard 11) en los archivos tocados por el ticket. Revisa el reporte HTML en apps/backend/reports/mutation/ y refuerza los tests que no matan mutantes sobrevivientes."
else
  echo "✨ Mutation Score >= 70% en los archivos tocados por el ticket en curso."
fi

exit "$STATUS"
