#!/usr/bin/env bash

# Generado por SK-27 para: OpenTofu 1.6+ (infrastructure/opentofu/) — ver
# docs/00_stack_manifest.md §6 (Guard 22). No es portable verbatim a otro motor de IaC
# (Terraform, Pulumi...) sin volver a correr SK-27 (TK-038: .agents/scripts/ solo contiene
# tooling agnóstico; este script vive en el árbol del proyecto consumidor porque asume
# el binario `tofu` y el layout real de `infrastructure/opentofu/`).
#
# TK-055: valida sintaxis HCL localmente (`tofu validate`) antes de llegar a CI — no hace
# `plan`/`apply` (eso exige credenciales/estado real, fuera del alcance de un gate local).
# Solo se genera/ejecuta si el proyecto declaró OpenTofu en el manifest (Guard 24) — un
# proyecto sin IaC declarada no debe fallar por no tener `tofu` instalado.
set -uo pipefail

IAC_DIR="infrastructure/opentofu"

if [ ! -d "$IAC_DIR" ]; then
  echo "✨ $IAC_DIR no existe — este proyecto no tiene IaC declarada todavía. Nada que verificar."
  exit 0
fi

if ! command -v tofu >/dev/null 2>&1; then
  echo "❌ El directorio $IAC_DIR existe (Guard 22 exige OpenTofu declarativo) pero el binario 'tofu' no está instalado en este entorno."
  echo "   Instálalo: https://opentofu.org/docs/intro/install/ — no se puede validar sintaxis sin él."
  exit 1
fi

echo "🔍 Validando sintaxis HCL de $IAC_DIR con 'tofu validate'..."
echo ""

pushd "$IAC_DIR" >/dev/null || exit 1

if [ ! -d ".terraform" ]; then
  echo "▶ Inicializando backend local (sin credenciales remotas, solo para validar sintaxis)..."
  tofu init -backend=false -input=false >/dev/null 2>&1
fi

if tofu validate; then
  popd >/dev/null
  echo ""
  echo "✨ Sintaxis HCL válida en $IAC_DIR."
  exit 0
else
  popd >/dev/null
  echo ""
  echo "❌ Sintaxis HCL inválida en $IAC_DIR. Corrige antes de continuar (esto NO reemplaza 'tofu plan' contra el estado real, que exige credenciales)."
  exit 1
fi
