#!/usr/bin/env bash

# Generado por SK-27 para: React 18 + TSX (apps/frontend) — ver docs/00_stack_manifest.md.
# No es portable verbatim a otro framework de UI sin volver a correr SK-27 (TK-038:
# .agents/scripts/ solo contiene tooling agnóstico; este script vive en el árbol del
# proyecto consumidor porque su patrón de búsqueda depende de JSX, bloqueado explícitamente
# para .agents/scripts/*.sh por check_agnosticism.py).
#
# Automatiza Guard 29 ("Design System Alignment & No-Inline-Style Guard", extendida
# 2026-08-31): un `style={{...}}` inline en un componente .tsx/.jsx solo se permite si el
# objeto de estilo consiste únicamente en la escritura de custom properties CSS (claves que
# empiezan con `--`) — la única excepción sancionada, para valores continuos calculados en
# runtime (ej. el ancho de una barra de progreso). Una auditoría manual completa del repo
# (2026-08-31) encontró y corrigió 303 de 307 ocurrencias preexistentes; bloquear TODO el
# repo de una sola vez ante la primera regresión futura sería consistente (ya no hay deuda
# preexistente real), pero igual que check_dead_code.sh/check_ticket_code_quality.sh se
# mantiene acotado al diff del ticket en curso — evita que un futuro caso legítimo aún no
# contemplado por esta heurística bloquee CI fuera del código que el ticket realmente toca.
set -uo pipefail

collect_changed() {
  git diff --name-only --diff-filter=ACMR -- '*.tsx' '*.jsx'
  git diff --name-only --staged --diff-filter=ACMR -- '*.tsx' '*.jsx'
  git ls-files --others --exclude-standard -- '*.tsx' '*.jsx'
}

CHANGED_FILES=$(collect_changed | sort -u)

echo "🔍 Verificando Guard 29 (sin estilos inline salvo custom properties '--') — repo completo, informativo en archivos fuera del diff..."
echo ""

ALL_FILES=$( { git ls-files -- 'apps/frontend/src/**/*.tsx' 'apps/frontend/src/**/*.jsx'; git ls-files --others --exclude-standard -- 'apps/frontend/src/**/*.tsx' 'apps/frontend/src/**/*.jsx'; } 2>/dev/null | sort -u)

if [ -z "$ALL_FILES" ]; then
  echo "✨ No hay archivos .tsx/.jsx en apps/frontend/src/ — nada que verificar."
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

# Extrae cada bloque `style={{ ... }}` completo (no solo la primera linea) contando llaves
# balanceadas, para poder inspeccionar TODAS sus claves, no solo la que aparece en el mismo
# renglon que `style={{`.
STYLE_START = re.compile(r"style=\{\{")
CUSTOM_PROP_KEY = re.compile(r"""['"]?(--[\w-]+)['"]?\s*:""")


def extract_style_blocks(text: str):
    blocks = []
    for match in STYLE_START.finditer(text):
        start = match.end() - 1  # posicion del primer '{' interno
        depth = 0
        i = start
        while i < len(text):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    break
            i += 1
        block = text[start:i + 1]
        line_no = text.count("\n", 0, match.start()) + 1
        blocks.append((line_no, block))
    return blocks


def is_sanctioned_exception(block: str) -> bool:
    # Excepcion Guard 29(a): el objeto SOLO escribe custom properties CSS (`'--x': ...`).
    # Se aproxima: si hay al menos una key de custom property Y ninguna key que no lo sea
    # (heuristica de "clave seguida de dos puntos" a nivel superficial del objeto).
    keys = re.findall(r"""['"]?([\w-]+)['"]?\s*:""", block)
    if not keys:
        return False
    return all(k.startswith("--") for k in keys)


blocking = []
informative_count = 0

for file_path in all_files:
    if not os.path.isfile(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    for line_no, block in extract_style_blocks(text):
        if is_sanctioned_exception(block):
            continue
        msg = f"{file_path}:{line_no} — style={{{{}}}} inline sin excepcion sancionada (Guard 29)"
        if file_path in changed:
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
    print("❌ El ticket en curso introduce/toca estilos inline sin excepcion sancionada (Guard 29). Usa una clase CSS en index.css (compartida) o en Componente.module.css (especifica de un componente), o si es un valor continuo calculado en runtime, escribe solo una custom property (ej. style={{ '--bar-pct': `${pct}%` }}).")
    sys.exit(1)

print("✨ Ningún archivo tocado por el ticket en curso introduce estilos inline nuevos fuera de las excepciones sancionadas.")
PYEOF
