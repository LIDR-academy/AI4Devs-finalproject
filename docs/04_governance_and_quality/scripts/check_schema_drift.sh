#!/usr/bin/env bash

# Generado por SK-27 para: Prisma ORM (apps/backend/prisma/schema.prisma) vs. el spec DDL
# documentado en docs/03_persistence_and_api/06_database_schema.md §4 — ver
# docs/00_stack_manifest.md. No es portable verbatim a otro ORM/spec sin volver a correr
# SK-27 (TK-038: .agents/scripts/ solo contiene tooling agnóstico; este script vive en el
# árbol del proyecto consumidor porque está acoplado a la sintaxis real de Prisma).
#
# TK-055: automatiza el Antipatrón C de rules/04_verified_implementation_standard.md
# ("spec aprobado que diverge en silencio del código real") para el modelo físico de BD.
# El spec §4 embebe un bloque ```prisma``` con la MISMA sintaxis `model X {` / `enum X {`
# que el schema.prisma real, así que ambos se parsean con la misma regex.
#
# Alcance: bloqueante SOLO si el diff sin commitear del ticket en curso toca schema.prisma
# o 06_database_schema.md — mismo criterio de check_ticket_code_quality.sh (TK-037). Divergencia
# preexistente ya evaluada y aceptada (TK-048: alcance mínimo, no se tocó User/Insumo/
# Remanente/StockMovement) se documenta abajo como riesgo residual, no bloquea.
set -uo pipefail

SCHEMA_FILE="apps/backend/prisma/schema.prisma"
SPEC_FILE="docs/03_persistence_and_api/06_database_schema.md"

# Riesgo residual aceptado (Guard 24 — requiere aprobación humana para tocar esta lista):
# TK-048: el spec documenta un modelo mas completo (enums de descarte/ubicacion/movimiento
# granulares) que el schema.prisma real nunca implemento por decision explicita de alcance
# minimo. UserStatus/SystemHealth existen en el schema real pero el spec nunca se actualizo
# para incluirlos (no son parte del dominio de negocio documentado en la Fase 1).
ALLOWED_MISSING_IN_SCHEMA=("MovementType" "DiscardReason" "LocationType")
ALLOWED_EXTRA_IN_SCHEMA=("UserStatus" "SystemHealth")

TOUCHED=$(git diff --name-only --diff-filter=ACMR -- "$SCHEMA_FILE" "$SPEC_FILE"
          git diff --name-only --staged --diff-filter=ACMR -- "$SCHEMA_FILE" "$SPEC_FILE"
          git ls-files --others --exclude-standard -- "$SCHEMA_FILE" "$SPEC_FILE")

extract_names() {
  # $1 = archivo, $2 = "1" si hay que extraer solo el bloque ```prisma``` (el .md embebe uno)
  local file="$1"
  local from_fence="$2"
  [ -f "$file" ] || return 0
  if [ "$from_fence" = "1" ]; then
    awk '/```prisma/{flag=1; next} /```/{flag=0} flag' "$file" | grep -oE '^(model|enum) [A-Za-z0-9_]+' | awk '{print $2}'
  else
    grep -oE '^(model|enum) [A-Za-z0-9_]+' "$file" | awk '{print $2}'
  fi
}

is_allowed() {
  local name="$1"; shift
  for a in "$@"; do [ "$name" = "$a" ] && return 0; done
  return 1
}

SCHEMA_NAMES=$(extract_names "$SCHEMA_FILE" 0 | sort -u)
SPEC_NAMES=$(extract_names "$SPEC_FILE" 1 | sort -u)

MISSING_IN_SCHEMA=$(comm -23 <(echo "$SPEC_NAMES") <(echo "$SCHEMA_NAMES"))
EXTRA_IN_SCHEMA=$(comm -13 <(echo "$SPEC_NAMES") <(echo "$SCHEMA_NAMES"))

echo "🔍 Comparando entidades (model/enum) entre $SCHEMA_FILE y $SPEC_FILE §4..."
echo ""

UNDOCUMENTED_DRIFT=0

while IFS= read -r name; do
  [ -z "$name" ] && continue
  if is_allowed "$name" "${ALLOWED_MISSING_IN_SCHEMA[@]}"; then
    echo "ℹ️  '$name' documentado en el spec pero no implementado — riesgo residual aceptado (TK-048). No bloquea."
  else
    echo "❌ '$name' está en el spec DDL pero NO existe en $SCHEMA_FILE (drift no documentado)."
    UNDOCUMENTED_DRIFT=1
  fi
done <<< "$MISSING_IN_SCHEMA"

while IFS= read -r name; do
  [ -z "$name" ] && continue
  if is_allowed "$name" "${ALLOWED_EXTRA_IN_SCHEMA[@]}"; then
    echo "ℹ️  '$name' existe en el schema real pero el spec nunca se actualizó — riesgo residual aceptado. No bloquea."
  else
    echo "❌ '$name' existe en $SCHEMA_FILE pero NO está documentado en el spec DDL (drift no documentado)."
    UNDOCUMENTED_DRIFT=1
  fi
done <<< "$EXTRA_IN_SCHEMA"

echo ""

if [ -z "$TOUCHED" ]; then
  if [ "$UNDOCUMENTED_DRIFT" -ne 0 ]; then
    echo "⚠️  Hay divergencia no documentada, pero el ticket en curso no toca ni $SCHEMA_FILE ni $SPEC_FILE — no bloquea (deuda preexistente fuera del alcance de este ticket)."
  fi
  echo "✨ Nada que verificar de forma bloqueante (el ticket en curso no toca el esquema físico ni su spec)."
  exit 0
fi

echo "📝 El ticket en curso toca: $(echo "$TOUCHED" | tr '\n' ' ')"

if [ "$UNDOCUMENTED_DRIFT" -ne 0 ]; then
  echo "❌ El ticket toca schema.prisma y/o el spec DDL, y hay divergencia no documentada entre ambos. Actualiza el que quedó atrás, o añade la entidad a ALLOWED_MISSING_IN_SCHEMA/ALLOWED_EXTRA_IN_SCHEMA en este script con justificación explícita (requiere aprobación humana)."
  exit 1
fi

echo "✨ schema.prisma y el spec DDL están alineados (o la divergencia está documentada como riesgo residual)."
