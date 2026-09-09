#!/usr/bin/env bash

# Generado por SK-27 para: TypeScript backend (apps/backend) — ver docs/00_stack_manifest.md.
# No es portable verbatim a otro lenguaje sin volver a correr SK-27 (TK-038: .agents/scripts/
# solo contiene tooling agnóstico; este script vive en el árbol del proyecto consumidor
# porque su heurística depende de sintaxis TS/Zod, bloqueada para .agents/scripts/*.sh por
# check_agnosticism.py).
#
# Automatiza dos reglas de docs/04_governance_and_quality/rules/security_rules.md nacidas de
# AUDIT-SEC-001 (F-1b / F-2):
#   C-SEC-1 (§4) — Resolución de rol/permiso fail-safe: prohibido un fallback de privilegio
#                  literal (`role || 'ADMIN'`, `role ?? 'ADMIN'`, `... : 'ADMIN'`). Un rol
#                  ausente se resuelve al MÍNIMO privilegio, nunca al máximo.
#   C-SEC-2 (§2) — Campo de privilegio contra conjunto cerrado: prohibido `role: z.string()`
#                  libre en un esquema de validación de payload; usar z.enum(...) o validar
#                  contra el catálogo persistido.
#
# Igual que check_inline_styles.sh / check_dead_code.sh: acotado al diff del ticket en curso
# (bloqueante), informativo para la deuda preexistente fuera del diff.
set -uo pipefail

collect_changed() {
  git diff --name-only --diff-filter=ACMR -- 'apps/backend/**/*.ts'
  git diff --name-only --staged --diff-filter=ACMR -- 'apps/backend/**/*.ts'
  git ls-files --others --exclude-standard -- 'apps/backend/**/*.ts'
}

CHANGED_FILES=$(collect_changed | sort -u)

ALL_FILES=$( { git ls-files -- 'apps/backend/**/*.ts'; git ls-files --others --exclude-standard -- 'apps/backend/**/*.ts'; } 2>/dev/null \
  | grep -Ev '(\.test\.ts$|/generated/|/dist/)' | sort -u)

echo "🔍 Verificando C-SEC-1/C-SEC-2 (sin fallback de privilegio literal; sin campo de rol como z.string() libre) — repo completo, informativo fuera del diff..."
echo ""

if [ -z "$ALL_FILES" ]; then
  echo "✨ No hay archivos .ts de backend que verificar."
  exit 0
fi

export CHANGED_FILES
export ALL_FILES
python3 - <<'PYEOF'
import os
import re
import sys

changed = set(f for f in os.environ.get("CHANGED_FILES", "").splitlines() if f)
all_files = [f for f in os.environ.get("ALL_FILES", "").splitlines() if f]

# C-SEC-1: fallback de privilegio literal a un rol elevado.
#   `... || 'ADMIN'`  /  `... ?? "ADMIN"`  /  `cond ? x : 'SUPERADMIN'`
# NO un simple valor de propiedad (`role: 'ADMIN'` en un seed/fixture) — eso no es un fallback.
PRIVILEGED = r"(?:ADMIN|SUPER_?ADMIN|SUPERUSER|ROOT|OWNER)"
PRIV_LIT = r"['\"][A-Za-z_]*" + PRIVILEGED + r"[A-Za-z_]*['\"]"
FALLBACK_RE = re.compile(r"(?:\|\||\?\?)\s*" + PRIV_LIT)
TERNARY_RE = re.compile(r"\?(?![.?])[^?:\n]*:\s*" + PRIV_LIT)
# C-SEC-2: campo de privilegio validado como string libre.
ZOD_FREE_RE = re.compile(
    r"\b(role|roleId|isAdmin|permissions?|scopes?)\b\s*:\s*z\.string\("
)

blocking = []
informative = 0

for file_path in all_files:
    if not os.path.isfile(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for i, line in enumerate(lines, start=1):
        stripped = line.strip()
        if stripped.startswith("//") or stripped.startswith("*"):
            continue

        hit = None
        if FALLBACK_RE.search(line) or TERNARY_RE.search(line):
            # Solo es sospechoso si la sentencia habla de rol/permiso.
            ctx = "".join(lines[max(0, i - 3): i + 1]).lower()
            if any(tok in ctx for tok in ("role", "permission", "scope", "isadmin", "privilege")):
                hit = "fallback de privilegio literal a un rol elevado (C-SEC-1) — resuelve al mínimo privilegio / lanza"
        if hit is None and ZOD_FREE_RE.search(line):
            hit = "campo de privilegio validado como z.string() libre (C-SEC-2) — usa z.enum(...) o valida contra el catálogo Role"

        if hit is None:
            continue

        msg = f"{file_path}:{i} — {hit}"
        if file_path in changed:
            blocking.append(msg)
        else:
            informative += 1
            print(f"ℹ️  {msg} (deuda preexistente, no bloquea)")

print("")
if informative:
    print(f"📊 {informative} hallazgo(s) preexistente(s) fuera del diff del ticket — informativo, no bloquea.")

if blocking:
    print("")
    for msg in blocking:
        print(f"❌ {msg}")
    print("")
    print("❌ El ticket en curso introduce/toca un patrón de privilegio inseguro (security_rules.md §2/§4, AUDIT-SEC-001).")
    sys.exit(1)

print("✨ Ningún archivo tocado por el ticket en curso introduce fallbacks de privilegio ni campos de rol como string libre.")
PYEOF
