#!/usr/bin/env bash

# Generado por SK-27 para: jscpd 5.x + pnpm (apps/backend/src, apps/frontend/src) —
# ver docs/00_stack_manifest.md §5.1. No portable verbatim a otro stack sin re-correr SK-27
# (TK-038: los scripts acoplados al stack viven aquí, no en el payload agnóstico de .agents/).
#
# C-1 (AUDIT-DEV-003, TK-085-FE): Gate de duplicación ACOTADO al diff del ticket en curso.
# `pnpm run duplication` (jscpd repo-wide) es bloqueante en CI, pero hoy sale rojo por deuda
# preexistente (3.2 % > 3 %) ajena a cualquier ticket nuevo — igual que pasaba con
# complexity/max-lines antes de TK-037.
#
# Criterio: un clon SOLO cuenta contra el ticket si NO existía en HEAD. Se compara el set de
# clones del working tree contra el de un árbol limpio de HEAD (`git archive`). La deuda de
# duplicación preexistente (incluso en un archivo que el ticket modificó ligeramente) no
# bloquea; un clon nuevo introducido por el ticket sí. Corre antes del commit de FASE 6.
set -uo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

JSCPD_PATHS=(apps/backend/src apps/frontend/src)

run_jscpd() { # $1 = base dir, $2 = output dir
  local base="$1" out="$2" paths=()
  for p in "${JSCPD_PATHS[@]}"; do [ -d "$base/$p" ] && paths+=("$base/$p"); done
  [ ${#paths[@]} -eq 0 ] && return 0
  npx jscpd "${paths[@]}" -c .jscpd.json --reporters json --output "$out" --silent >/dev/null 2>&1 || true
}

# Signature = par de archivos "<relpath A>|<relpath B>" (orden normalizado). Un cambio de
# tamaño del clon por una edición no relacionada en otra parte del archivo NO cuenta como
# clon nuevo; solo cuenta si el ticket introduce duplicación entre dos archivos que no la
# tenían antes. El backstop repo-wide sigue siendo `pnpm run duplication` en CI.
clone_sigs() { # $1 = jscpd-report.json, $2 = path prefix to strip
  local report="$1" strip="$2"
  [ -f "$report" ] || return 0
  node --input-type=module -e '
    import fs from "node:fs";
    const [report, strip] = process.argv.slice(1);
    const r = JSON.parse(fs.readFileSync(report, "utf8"));
    const rel = (p) => (p || "").replace(strip, "").replace(/^\/+/, "");
    const seen = new Set();
    for (const d of r.duplicates ?? []) {
      const [x, y] = [rel(d.firstFile?.name), rel(d.secondFile?.name)].sort();
      const sig = `${x}|${y}`;
      if (!seen.has(sig)) { seen.add(sig); console.log(sig); }
    }
  ' "$report" "$strip"
}

echo "🔍 Duplicación (jscpd) — comparando working tree vs. HEAD, bloquea solo clones nuevos del ticket."

# --- Baseline: árbol limpio de HEAD ---
mkdir -p "$TMP/head"
git archive HEAD | tar -x -C "$TMP/head"
run_jscpd "$TMP/head" "$TMP/out-head"
clone_sigs "$TMP/out-head/jscpd-report.json" "$TMP/head/" | sort -u > "$TMP/sigs-head.txt"

# --- Actual: working tree ---
run_jscpd "$REPO_ROOT" "$TMP/out-now"
clone_sigs "$TMP/out-now/jscpd-report.json" "$REPO_ROOT/" | sort -u > "$TMP/sigs-now.txt"

HEAD_COUNT=$(wc -l < "$TMP/sigs-head.txt" | tr -d ' ')
NOW_COUNT=$(wc -l < "$TMP/sigs-now.txt" | tr -d ' ')
NEW_CLONES=$(comm -13 "$TMP/sigs-head.txt" "$TMP/sigs-now.txt")

echo "📊 Clones en HEAD: ${HEAD_COUNT} · en working tree: ${NOW_COUNT} (deuda preexistente informativa)."

if [ -z "$NEW_CLONES" ]; then
  echo "✨ El ticket no introduce ningún clon nuevo."
  exit 0
fi

echo ""
echo "❌ Clones nuevos introducidos por el ticket:"
echo "$NEW_CLONES" | awk -F'|' '{ printf "   - %s  ⇄  %s\n", $1, $2 }'
echo ""
echo "Extrae el fragmento común a un helper/componente compartido antes de cerrar el ticket."
exit 1
