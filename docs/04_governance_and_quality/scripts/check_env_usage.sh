#!/usr/bin/env bash

# Generado por SK-27 para: apps/backend/src/infrastructure/config/environment.ts (Zod) —
# ver docs/00_stack_manifest.md. No es portable verbatim a otro esquema de validación de
# entorno sin volver a correr SK-27 (TK-038: .agents/scripts/ solo contiene tooling
# agnóstico; este script vive en el árbol del proyecto consumidor porque está acoplado a
# la ubicación real del validador de entorno de este proyecto).
#
# TK-055: automatiza el Antipatrón A de rules/04_verified_implementation_standard.md
# ("config validada pero nunca consumida") — nacido de TK-046, donde CORS_ALLOWED_ORIGINS
# y RATE_LIMIT_* se validaban con Zod (Fail-Fast) pero ningún middleware las leía.
#
# Alcance: siempre corre completo (no acotado a diff) — es una lista fija y pequeña de
# claves declaradas en environment.ts, barato de verificar cada vez, igual que
# check_dependency_audit.sh.
set -uo pipefail

ENV_FILE="apps/backend/src/infrastructure/config/environment.ts"
SCHEMA_FILE="apps/backend/prisma/schema.prisma"
SRC_DIR="apps/backend/src"

[ -f "$ENV_FILE" ] || { echo "✨ $ENV_FILE no existe — nada que verificar."; exit 0; }

# Riesgo residual aceptado (Guard 24 — requiere aprobación humana para tocar esta lista):
# claves consumidas implícitamente por una librería de terceros en vez de por código propio
# grepeable (ej. Prisma lee DATABASE_URL directo de process.env dentro de @prisma/client).
IMPLICITLY_CONSUMED=("DATABASE_URL")

echo "🔍 Verificando que toda clave validada en $ENV_FILE tenga al menos un call-site real..."
echo ""

KEYS=$(awk '/environmentSchema = z\.object\(\{/{flag=1; next} /^\}\);/{flag=0} flag' "$ENV_FILE" \
  | grep -oE '^\s*[A-Z0-9_]+:' | tr -d ' :')

UNCONSUMED=0

for key in $KEYS; do
  is_implicit=0
  for a in "${IMPLICITLY_CONSUMED[@]}"; do [ "$key" = "$a" ] && is_implicit=1 && break; done

  # Busca process.env.KEY o env.KEY en el resto de src/ (excluyendo environment.ts y tests),
  # y env("KEY") en schema.prisma (sintaxis Prisma para datasource url, etc.).
  hits_src=$(grep -rlE "process\.env\.$key\b|\benv\.$key\b" "$SRC_DIR" --include="*.ts" 2>/dev/null \
    | grep -v -F "$ENV_FILE" | grep -v '\.test\.ts$' | wc -l)
  hits_schema=0
  if [ -f "$SCHEMA_FILE" ]; then
    hits_schema=$(grep -cE "env\(\"$key\"\)" "$SCHEMA_FILE" 2>/dev/null)
    hits_schema=${hits_schema:-0}
  fi

  if [ "$hits_src" -gt 0 ] || [ "$hits_schema" -gt 0 ]; then
    echo "✅ $key — consumido en $((hits_src + hits_schema)) sitio(s) real(es)."
  elif [ "$is_implicit" -eq 1 ]; then
    echo "ℹ️  $key — consumo implícito documentado (ver IMPLICITLY_CONSUMED en este script). No bloquea."
  else
    echo "❌ $key — validado con Zod pero SIN ningún call-site real que lo lea (Antipatrón A)."
    UNCONSUMED=1
  fi
done

echo ""
if [ "$UNCONSUMED" -ne 0 ]; then
  echo "❌ Hay variables de entorno validadas pero nunca consumidas. Cablea un call-site real, o documenta el consumo implícito en IMPLICITLY_CONSUMED con justificación (requiere aprobación humana)."
  exit 1
fi

echo "✨ Todas las variables de entorno validadas tienen un call-site real (o consumo implícito documentado)."
