#!/usr/bin/env bash

# Instala .agents/ en un proyecto nuevo (mismo o distinto repo) junto con los
# entrypoints mínimos que cada herramienta de IA necesita para descubrirlo.
#
# Uso: bash .agents/scripts/install.sh /ruta/al/proyecto/destino
set -euo pipefail

SOURCE_AGENTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${1:-}"

if [ -z "$TARGET_DIR" ]; then
  echo "❌ Uso: bash .agents/scripts/install.sh /ruta/al/proyecto/destino"
  exit 1
fi

mkdir -p "$TARGET_DIR"
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

if [ "$TARGET_DIR" = "$(dirname "$SOURCE_AGENTS_DIR")" ]; then
  echo "❌ El destino es el mismo proyecto donde vive este .agents/. Usa una ruta distinta."
  exit 1
fi

echo "📦 Instalando .agents/ en: $TARGET_DIR"

if [ -d "$TARGET_DIR/.agents" ]; then
  echo "⚠️  $TARGET_DIR/.agents ya existe. Cancelando para no sobrescribir un framework ya instalado."
  echo "   Si quieres actualizarlo, borra o renombra ese directorio manualmente primero."
  exit 1
fi

cp -R "$SOURCE_AGENTS_DIR" "$TARGET_DIR/.agents"
rm -rf "$TARGET_DIR/.agents/scripts/__pycache__" "$TARGET_DIR/.agents/scripts/tests/__pycache__"
echo "✅ .agents/ copiado."

# TK-065: deja rastro de procedencia — install.sh hace un cp -R sin verificación de
# integridad; este archivo permite que el proyecto destino diferencie más adelante contra
# el origen real (detectar drift/tampering), en vez de perder toda referencia al commit
# exacto que se copió. Solo usa git/date/grep (agnóstico, pasa check_agnosticism.py).
SOURCE_COMMIT="$(git -C "$SOURCE_AGENTS_DIR" rev-parse HEAD 2>/dev/null || echo "desconocido (origen no es un repositorio git)")"
SOURCE_REMOTE="$(git -C "$SOURCE_AGENTS_DIR" config --get remote.origin.url 2>/dev/null || echo "desconocido (sin remote 'origin' configurado)")"
FRAMEWORK_VERSION="$(grep -m1 '^version:' "$SOURCE_AGENTS_DIR/README.md" 2>/dev/null | sed -e 's/^version:[[:space:]]*//' -e 's/^"//' -e 's/"$//' || echo "desconocido")"
INSTALL_TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

cat > "$TARGET_DIR/.agents/INSTALLED_FROM.md" <<EOF
# 📦 Procedencia de esta instalación de \`.agents/\`

Generado automáticamente por \`install.sh\` (\`TK-065\`) — no editar a mano.

- **Ruta de origen:** \`$SOURCE_AGENTS_DIR\`
- **Remote git de origen:** \`$SOURCE_REMOTE\`
- **Commit de origen:** \`$SOURCE_COMMIT\`
- **Versión del framework instalada:** \`$FRAMEWORK_VERSION\`
- **Fecha de instalación (UTC):** \`$INSTALL_TIMESTAMP\`

Este archivo no tiene efecto sobre el comportamiento del agente — es solo un registro para
poder diferenciar manualmente esta copia contra el origen (\`git diff\` entre ambos árboles
\`.agents/\`) si en el futuro se sospecha de drift o de una modificación no revisada.
EOF
echo "✅ INSTALLED_FROM.md (procedencia de la instalación) creado."

ENTRYPOINT_CONTENT_BOOTSTRAPPED='# 🤖 AI Assistant Entrypoint

> All operational rules, architectural guidelines, quality gates, and workflows for this repository are defined in the Single Source of Truth (SSoT):
> **Read [`AGENTS.md`](./AGENTS.md) first before performing any action.**'

AGENTS_STUB='# 🤖 AI Assistant Entrypoint (proyecto sin bootstrapear)

> Este proyecto tiene `.agents/` instalado pero **todavía no fue bootstrapeado** — este archivo es un stub temporal, no el contrato operativo real.

## Próximo paso obligatorio

**¿Este directorio está vacío o sin código relevante?**
Invoca: `@.agents/workflows/00_greenfield_bootstrap_workflow.md Arranca un proyecto nuevo a partir de esta idea: [descripción]`

**¿Este directorio ya tiene código funcionando?**
Invoca: `@.agents/workflows/00_brownfield_adoption_workflow.md Adopta .agents/ en este código existente: [ruta]`

Cualquiera de los dos workflows, al llegar a su fase de contrato operativo, invoca `SK-35_generate_root_contract.md` y **reemplaza este archivo** por el `AGENTS.md` real de 6 secciones. No edites este stub a mano — es autogenerado y desechable.'

if [ ! -f "$TARGET_DIR/AGENTS.md" ]; then
  printf '%s\n' "$AGENTS_STUB" > "$TARGET_DIR/AGENTS.md"
  echo "✅ AGENTS.md (stub de arranque) creado."
else
  echo "ℹ️  AGENTS.md ya existe en el destino — no se toca (puede ser un proyecto ya bootstrapeado)."
fi

for entry in CLAUDE.md GEMINI.md; do
  if [ ! -f "$TARGET_DIR/$entry" ]; then
    printf '%s\n' "$ENTRYPOINT_CONTENT_BOOTSTRAPPED" > "$TARGET_DIR/$entry"
    echo "✅ $entry creado."
  else
    echo "ℹ️  $entry ya existe en el destino — no se toca."
  fi
done

echo ""
echo "🎉 Instalación completa. Siguiente paso: abre el proyecto en $TARGET_DIR con tu asistente de IA"
echo "   y pídele que lea AGENTS.md — el stub lo guiará al workflow de bootstrap correcto."
