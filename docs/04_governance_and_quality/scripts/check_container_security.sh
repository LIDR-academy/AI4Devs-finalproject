#!/usr/bin/env bash

# Generado por SK-27 para: Docker (Node 24 LTS + nginx) + OpenTofu — ver docs/00_stack_manifest.md.
# No es portable verbatim a otro engine de contenedores/IaC sin volver a correr SK-27
# (TK-038: .agents/scripts/ solo contiene tooling agnóstico; los scripts acoplados al
# stack del proyecto viven aquí, generados, no en el payload portable).
#
# TK-042 / Guard 25: Gate de hardening de contenedores/IaC ACOTADO al diff del ticket
# en curso (mismo criterio que TK-037/check_ticket_code_quality.sh). Deuda preexistente
# en Dockerfile/docker-compose.yml/*.tf que el ticket actual no tocó NO bloquea; los
# archivos que el ticket crea o modifica sí se exigen limpios.
#
# Alcance = SOLO cambios sin commitear (working tree + staged + nuevos), no diff contra
# una rama base: este proyecto no rama por ticket (ver git_rules.md).
set -uo pipefail

TF_PATHSPECS=('infrastructure/*.tf' 'infrastructure/**/*.tf')

collect_changed() {
  git diff --name-only --diff-filter=ACMR -- '**/Dockerfile*' 'docker-compose*.yml' "${TF_PATHSPECS[@]}"
  git diff --name-only --staged --diff-filter=ACMR -- '**/Dockerfile*' 'docker-compose*.yml' "${TF_PATHSPECS[@]}"
  git ls-files --others --exclude-standard -- '**/Dockerfile*' 'docker-compose*.yml' "${TF_PATHSPECS[@]}"
}

CHANGED_FILES=$(collect_changed | sort -u)

if [ -z "$CHANGED_FILES" ]; then
  echo "✨ No hay Dockerfile/docker-compose.yml/*.tf sin commitear. Nada que verificar (corre esto antes del commit del ticket)."
  exit 0
fi

echo "🔍 Verificando hardening de contenedores/IaC SOLO en archivos sin commitear del ticket en curso:"
echo "$CHANGED_FILES" | sed 's/^/   - /'
echo ""

EXPECTED_NODE_MAJOR="24"
FAILED=0

while IFS= read -r file; do
  [ -f "$file" ] || continue
  base=$(basename "$file")

  case "$base" in
    Dockerfile*)
      # (a) Runtime pineado según docs/00_stack_manifest.md §1 (Guard 23)
      while IFS= read -r from_line; do
        if echo "$from_line" | grep -qE "node:"; then
          if ! echo "$from_line" | grep -qE "node:${EXPECTED_NODE_MAJOR}(-|\$)"; then
            echo "❌ $file: '$from_line' no fija Node ${EXPECTED_NODE_MAJOR} LTS (Guard 23). Usa node:${EXPECTED_NODE_MAJOR}-alpine o equivalente."
            FAILED=1
          fi
        fi
      done < <(grep -iE "^\s*FROM\s" "$file" || true)

      # (b) Usuario no-root obligatorio
      if ! grep -qE "^\s*USER\s+\S+" "$file"; then
        echo "❌ $file: sin directiva USER — el contenedor correría como root (Guard 25)."
        FAILED=1
      fi
      ;;
  esac

  # (c) Sin secretos hardcodeados en texto plano — cubre tanto YAML (KEY: "valor") como
  #     HCL/env-list ("KEY=valor" dentro de un string, ej. terraform env = [...]).
  #     Permitido: referencias a variable/secret-manager (${VAR}, $(...), secrets.X, var.X,
  #     local.X, env.X) o placeholders explícitos (YOUR_KEY_HERE, CHANGE_ME).
  while IFS= read -r secret_line; do
    if echo "$secret_line" | grep -qE '(SECRET|PASSWORD|TOKEN|API_KEY)[A-Za-z0-9_]*\s*[:=]'; then
      if ! echo "$secret_line" | grep -qE '\$\{|\$\(|secrets\.|var\.|local\.|env\.|YOUR_KEY_HERE|CHANGE_ME'; then
        echo "❌ $file: posible secreto hardcodeado en texto plano → '$secret_line'"
        FAILED=1
      fi
    fi
  done < <(grep -iE '(SECRET|PASSWORD|TOKEN|API_KEY)' "$file" || true)
done <<< "$CHANGED_FILES"

# (d) .dockerignore obligatorio si se toca un Dockerfile
if echo "$CHANGED_FILES" | grep -qE "Dockerfile"; then
  if [ ! -f ".dockerignore" ]; then
    echo "❌ Se modificó un Dockerfile pero no existe .dockerignore en la raíz del repo."
    FAILED=1
  fi
fi

echo ""
if [ "$FAILED" -ne 0 ]; then
  echo "❌ Archivos sin commitear de este ticket violan el hardening de contenedores/IaC (Guard 25). Corrige antes de cerrar el ticket."
  exit 1
fi

echo "✨ Archivos sin commitear de este ticket cumplen el hardening de contenedores/IaC."
