#!/usr/bin/env bash

# Generado por SK-27 para: knip 6.x + pnpm monorepo (apps/backend, apps/frontend) — ver
# docs/00_stack_manifest.md. No es portable verbatim a otro detector de código muerto sin
# volver a correr SK-27 (TK-038: .agents/scripts/ solo contiene tooling agnóstico; este
# script vive en el árbol del proyecto consumidor porque invoca `npx knip` directamente,
# bloqueado explícitamente para .agents/scripts/*.sh por check_agnosticism.py).
#
# TK-055: automatiza Guard 5 ("No Dead Code / Zombie Flags"). Una corrida completa contra
# el repo real (2026-08-21) encontró 14 hallazgos preexistentes (exports de esquemas Zod de
# controllers nunca importados fuera de su propio archivo, 1 archivo/1 dependencia sin uso,
# 1 export duplicado) — bloquear TODO el repo de una sola vez habría roto CI de inmediato
# por deuda preexistente. Igual que check_ticket_code_quality.sh (TK-037): bloqueante SOLO
# sobre archivos que el ticket en curso creó/modificó; el resto corre informativo.
set -uo pipefail

collect_changed() {
  git diff --name-only --diff-filter=ACMR -- '*.ts' '*.tsx'
  git diff --name-only --staged --diff-filter=ACMR -- '*.ts' '*.tsx'
  git ls-files --others --exclude-standard -- '*.ts' '*.tsx'
}

CHANGED_FILES=$(collect_changed | sort -u)

echo "🔍 Ejecutando knip (código/exports/dependencias sin uso) — repo completo, informativo..."
echo ""

KNIP_JSON=$(npx knip --reporter json 2>/dev/null || true)

if [ -z "$KNIP_JSON" ]; then
  echo "✨ knip no reportó hallazgos."
  exit 0
fi

export KNIP_JSON
python3 - "$CHANGED_FILES" <<'PYEOF'
import json, os, sys

changed = set(f for f in sys.argv[1].splitlines() if f)
data = json.loads(os.environ["KNIP_JSON"])
issues = data.get("issues", [])

CATEGORY_LABELS = {
    "files": "archivo sin usar",
    "dependencies": "dependencia sin usar",
    "devDependencies": "devDependency sin usar",
    "exports": "export sin usar",
    "types": "tipo exportado sin usar",
    "duplicates": "export duplicado",
    "unlisted": "import sin declarar en package.json",
    "unresolved": "import no resoluble",
}

blocking = []
informative_count = 0

for entry in issues:
    file_path = entry.get("file", "")
    is_touched = file_path in changed
    for category, label in CATEGORY_LABELS.items():
        items = entry.get(category) or []
        if category == "duplicates":
            # cada elemento es una lista de nombres duplicados entre si, no un item suelto
            items = [{"name": " / ".join(d.get("name", "?") for d in group)} for group in items]
        for item in items:
            name = item.get("name", file_path)
            line = item.get("line")
            loc = f":{line}" if line else ""
            msg = f"{file_path}{loc} — {label}: {name}"
            if is_touched:
                blocking.append(msg)
            else:
                informative_count += 1
                print(f"ℹ️  {msg} (deuda preexistente, no bloquea)")

print("")
if informative_count:
    print(f"📊 {informative_count} hallazgo(s) preexistente(s) fuera del diff del ticket — informativo, no bloquea.")

if blocking:
    print("")
    for msg in blocking:
        print(f"❌ {msg}")
    print("")
    print("❌ El ticket en curso introduce/toca código muerto detectado por knip (Guard 5). Elimínalo o justifica con un comentario `// knip-ignore` si es un falso positivo real.")
    sys.exit(1)

print("✨ Ningún archivo tocado por el ticket en curso introduce código muerto nuevo.")
PYEOF
